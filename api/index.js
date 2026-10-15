import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

/* --- [ CONFIGURACIÓN DE SUPABASE ] --- */
const SUPABASE_URL = process.env.SUPABASE_URL || "https://klrargyceafqfitqyctd.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "sb_publishable_jKkSy3q5J0YR7ggeDqrJyQ_MErzd3Tj"; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_ID = "8968109534"; 
const MIN_OPERATION = 1.0; // 1 USDT mínimo para operaciones

/* --- [ DICCIONARIO MULTILINGÜE (ES / EN) ] --- */
const translations = {
    es: {
        banned: "Tu cuenta está suspendida.",
        min_amount: "El monto mínimo es de 1 USDT.",
        insufficient_balance: "Saldo insuficiente.",
        success_plan: "Plan de rendimiento creado con éxito.",
        success_reinvest: "Reinversión realizada con éxito.",
        success_withdraw: "Retiro solicitado con éxito."
    },
    en: {
        banned: "Your account has been suspended.",
        min_amount: "The minimum amount is 1 USDT.",
        insufficient_balance: "Insufficient balance.",
        success_plan: "Performance plan created successfully.",
        success_reinvest: "Reinvestment completed successfully.",
        success_withdraw: "Withdrawal requested successfully."
    }
};

const getLang = (req) => req.headers['accept-language']?.includes('en') ? 'en' : 'es';

/* --- [ 1. VERIFICACIÓN Y REGISTRO DE USUARIO ] --- */
app.post('/api/verify', async (req, res) => {
    try {
        const { user } = req.body;
        const lang = getLang(req);
        const t = translations[lang];

        if (!user || !user.id) {
            return res.status(400).json({ success: false, error: 'MISSING_DATA' });
        }

        let { data: dbUser, error } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
        if (error) throw error;

        if (dbUser?.is_banned) {
            return res.json({ success: false, error: 'USER_BANNED', message: t.banned });
        }

        // Si no existe, registrar usuario nuevo
        if (!dbUser) {
            const { data: newUser, error: insertError } = await supabase.from('users').insert([{
                id: user.id,
                username: user.username || 'user',
                balance: 0.0000,
                is_banned: false
            }]).select().single();

            if (insertError) throw insertError;
            dbUser = newUser;
        }

        // Obtener planes activos del usuario
        const { data: activePlans } = await supabase.from('plans').select('*').eq('user_id', user.id).eq('status', 'ACTIVE');

        return res.json({
            success: true,
            user: dbUser,
            plans: activePlans || []
        });

    } catch (err) {
        console.error("Error en /api/verify:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

/* --- [ 2. CREAR PLAN DE RENDIMIENTO (5% diario por 40 días) ] --- */
app.post('/api/plans/create', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const lang = getLang(req);
        const t = translations[lang];

        const investmentAmount = parseFloat(amount);
        if (isNaN(investmentAmount) || investmentAmount < MIN_OPERATION) {
            return res.json({ success: false, error: t.min_amount });
        }

        // Verificar saldo disponible
        const { data: user, error: userError } = await supabase.from('users').select('balance').eq('id', userId).single();
        if (userError || !user || user.balance < investmentAmount) {
            return res.json({ success: false, error: t.insufficient_balance });
        }

        // Descontar saldo usando función RPC
        await supabase.rpc('decrement_balance', { user_id_param: userId, amount_param: investmentAmount });

        // Calcular rendimiento diario (5% del capital)
        const dailyReturn = investmentAmount * 0.05;

        // Crear el plan de 40 días
        const { data: newPlan, error: planError } = await supabase.from('plans').insert([{
            user_id: userId,
            capital_usdt: investmentAmount,
            daily_return_usdt: dailyReturn,
            days_elapsed: 0,
            reinvestment_count: 0,
            status: 'ACTIVE'
        }]).select().single();

        if (planError) throw planError;

        // Registrar en historial unificado
        await supabase.from('transactions_history').insert([{
            user_id: userId,
            type: 'DEPOSIT',
            amount: investmentAmount,
            description: `Creación de plan de rendimiento (${investmentAmount} USDT)`,
            reference_id: newPlan.id
        }]);

        return res.json({ success: true, message: t.success_plan, plan: newPlan });

    } catch (err) {
        console.error("Error en creación de plan:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

/* --- [ 3. REINVERSIÓN (Hasta 3 veces, monto >= al depósito anterior) ] --- */
app.post('/api/plans/reinvest', async (req, res) => {
    try {
        const { userId, parentPlanId, amount } = req.body;
        const reinvestAmount = parseFloat(amount);
        const lang = getLang(req);
        const t = translations[lang];

        if (isNaN(reinvestAmount) || reinvestAmount < MIN_OPERATION) {
            return res.json({ success: false, error: t.min_amount });
        }

        // Buscar plan padre para validar límites
        const { data: parentPlan, error: parentError } = await supabase.from('plans').select('*').eq('id', parentPlanId).single();
        if (parentError || !parentPlan) {
            return res.json({ success: false, error: "Plan de origen no encontrado." });
        }

        if (parentPlan.reinvestment_count >= 3) {
            return res.json({ success: false, error: "Este plan ya alcanzó el límite máximo de 3 reinversiones." });
        }

        if (reinvestAmount < parentPlan.capital_usdt) {
            return res.json({ success: false, error: `La reinversión debe ser igual o mayor al depósito anterior (${parentPlan.capital_usdt} USDT).` });
        }

        // Verificar saldo disponible
        const { data: user } = await supabase.from('users').select('balance').eq('id', userId).single();
        if (!user || user.balance < reinvestAmount) {
            return res.json({ success: false, error: t.insufficient_balance });
        }

        // Descontar saldo y actualizar contador de reinversiones del plan original
        await supabase.rpc('decrement_balance', { user_id_param: userId, amount_param: reinvestAmount });
        await supabase.from('plans').update({ reinvestment_count: parentPlan.reinvestment_count + 1 }).eq('id', parentPlanId);

        // Crear nuevo plan derivado
        const dailyReturn = reinvestAmount * 0.05;
        const { data: newPlan, error: newPlanError } = await supabase.from('plans').insert([{
            user_id: userId,
            capital_usdt: reinvestAmount,
            daily_return_usdt: dailyReturn,
            days_elapsed: 0,
            reinvestment_count: 0,
            parent_plan_id: parentPlanId,
            status: 'ACTIVE'
        }]).select().single();

        if (newPlanError) throw newPlanError;

        // Registrar en historial
        await supabase.from('transactions_history').insert([{
            user_id: userId,
            type: 'REINVESTMENT',
            amount: reinvestAmount,
            description: `Reinversión (${reinvestAmount} USDT)`,
            reference_id: newPlan.id
        }]);

        return res.json({ success: true, message: t.success_reinvest, plan: newPlan });

    } catch (err) {
        console.error("Error en reinversión:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

/* --- [ 4. SOLICITUD DE RETIRO (USDT BEP-20 / GRAM TON con comisiones reales) ] --- */
app.post('/api/withdraw', async (req, res) => {
    try {
        const { userId, currency, address, amount } = req.body;
        const requestedAmount = parseFloat(amount);
        const lang = getLang(req);
        const t = translations[lang];

        if (isNaN(requestedAmount) || requestedAmount < MIN_OPERATION) {
            return res.json({ success: false, error: t.min_amount });
        }

        if (!['USDT', 'GRAM'].includes(currency)) {
            return res.json({ success: false, error: "Moneda de retiro no soportada." });
        }

        // Comisiones de red reales estimadas
        const networkFees = {
            'USDT': 0.30, // BEP-20 fee estimada
            'GRAM': 0.05  // TON fee estimada
        };

        const fee = networkFees[currency] || 0.1;
        const netAmount = requestedAmount - fee;

        if (netAmount <= 0) {
            return res.json({ success: false, error: "El monto es menor o igual a la comisión de red." });
        }

        // Verificar estado y saldo del usuario
        const { data: user, error: userError } = await supabase.from('users').select('balance, withdraw_banned').eq('id', userId).single();
        if (userError || !user) {
            return res.json({ success: false, error: "Usuario no encontrado." });
        }

        if (user.withdraw_banned) {
            return res.json({ success: false, error: "Los retiros están bloqueados para esta cuenta." });
        }

        if (user.balance < requestedAmount) {
            return res.json({ success: false, error: t.insufficient_balance });
        }

        // Descontar saldo total solicitado
        await supabase.rpc('decrement_balance', { user_id_param: userId, amount_param: requestedAmount });

        // Registrar solicitud de retiro
        const { data: withdrawal, error: withdrawError } = await supabase.from('withdrawals').insert([{
            user_id: userId,
            currency: currency,
            destination_address: address,
            amount_requested: requestedAmount,
            network_fee: fee,
            amount_net: netAmount,
            status: 'PENDING'
        }]).select().single();

        if (withdrawError) throw withdrawError;

        // Registrar en historial unificado
        await supabase.from('transactions_history').insert([{
            user_id: userId,
            type: 'WITHDRAWAL',
            amount: requestedAmount,
            description: `Solicitud de retiro de ${requestedAmount} ${currency} (${netAmount} netos)`,
            reference_id: withdrawal.id
        }]);

        return res.json({ 
            success: true, 
            message: t.success_withdraw, 
            details: {
                requested: requestedAmount,
                fee: fee,
                net: netAmount,
                currency: currency
            }
        });

    } catch (err) {
        console.error("Error en retiro:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

export default app;
