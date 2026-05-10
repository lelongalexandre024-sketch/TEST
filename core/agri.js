// core/agri.js
export const AgriModule = {
    start: async () => {
        // Simulation de l'action (à remplacer par le vrai clic)
        // Ici, on cherche le bouton "Claim" typique
        let btn = null;
        
        // Tenta plusieurs sélecteurs courants pour être robuste
        const selectors = [
            '.fto_claim_button', 
            '[class*="claim"]', 
            '.action_collect'
        ];

        for(let sel of selectors) {
            btn = document.querySelector(sel);
            if(btn) break;
        }

        if (!btn) return { success: false, msg: "Bouton de collecte introuvable." };

        // 1. Action Clic
        btn.click();
        window.app.log("Collecte lancée (Agri)", "action");
        
        // 2. Attendre la fin du cooldown (aléatoire entre 5s et 15s pour simuler un vrai joueur)
        const waitTime = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;
        
        await new Promise(r => setTimeout(r, waitTime));

        // 3. Mettre à jour le compteur visuel
        document.getElementById('count-agri').innerText = parseInt(document.getElementById('count-agri').innerText) + 1;
        
        window.app.log("Collecte réussie.", "success");
        return { success: true, msg: "Collecte OK" };
    },

    stop: () => { window.app.log("Module Agri arrêté.", "warn"); }
};
