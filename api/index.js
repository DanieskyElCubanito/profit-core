import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Configuración de Supabase (Usa tus credenciales reales)
const SUPABASE_URL = process.env.SUPABASE_URL || "https://klrargyceafqfitqyctd.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "sb_publishable_jKkSy3q5J0YR7ggeDqrJyQ_MErzd3Tj"; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_ID = "8968109534"; 
const MIN_OPERATION = 1.0; // 1 USDT mínimo para todo

// Diccionario de traducciones básico (Español / Inglés)
const translations = {
    es: {
        banned: "Tu cuenta está suspendida.",
        min_amount: "El monto mínimo es de 1 USDT.",
        insufficient_balance: "Saldo insuficiente.",
        success_plan: "Plan de rendimiento creado con éxito."
    },
    en: {
        banned: "Your account has been suspended.",
        min_amount: "The minimum amount is 1 USDT.",
        insufficient_balance: "Insufficient balance.",
        success_plan: "Performance plan created successfully."
    }
};

// Helper para obtener idioma
const getLang = (req) => req.headers['accept-language']?.includes('en') ? 'en' : 'es';

/* --- [ 1. VERIFICACIÓN DE USUARIO ] --- */
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

        // Si el usuario no existe, lo creamos
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

/* --- [ 2. CREAR PLAN O INVERTIR (5% diario por 40 días) ] --- */
app.post('/api/plans/create', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const lang = getLang(req);
        const t = translations[lang];

        const investmentAmount = parseFloat(amount);
        if (isNaN(investmentAmount) || investmentAmount < MIN_OPERATION) {
            return res.json({ success: false, error: t.min_amount });
        }

        // Verificar saldo del usuario
        const { data: user, error: userError } = await supabase.from('users').select('balance').eq('id', userId).single();
        if (userError || !user || user.balance < investmentAmount) {
            return res.json({ success: false, error: t.insufficient_balance });
        }

        // Descontar saldo usando la función RPC
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

        // Registrar en el historial unificado
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

/* --- [ 3. REINVERSIÓN (Hasta 3 veces, monto >= anterior) ] --- */
app.post('/api/plans/reinvest', async (req, res) => {
    try {
        const { userId, parentPlanId, amount } = req.body;
        const reinvestAmount = parseFloat(amount);

        if (isNaN(reinvestAmount) || reinvestAmount < MIN_OPERATION) {
            return res.json({ success: false, error: "Mínimo 1 USDT para reinvertir." });
        }

        // Buscar plan padre para validar límites de reinversión
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
            return res.json({ success: false, error: "Saldo insuficiente para reinvertir." });
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

        // Historial
        await supabase.from('transactions_history').insert([{
            user_id: userId,
            type: 'REINVESTMENT',
            amount: reinvestAmount,
            description: `Reinversión (${reinvestAmount} USDT)`,
            reference_id: newPlan.id
        }]);

        return res.json({ success: true, message: "Reinversión realizada con éxito.", plan: newPlan });

    } catch (err) {
        console.error("Error en reinversión:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

export default app;
