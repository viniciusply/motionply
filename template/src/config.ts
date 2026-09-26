// MotionPly · @oviniciusply
// Configuração da edição — respostas do questionário inicial da skill.
//  SPEED:   velocidade final do render (1 = normal; 1.2 = 20% mais rápido, voz com pitch preservado)
//  PALETTE: "mono" = preto & branco (padrão) | "azul" = azul-escuro/azul-claro/branco
export const CONFIG = {
  SPEED: 1,
  PALETTE: "mono" as "mono" | "azul",
  // true quando existir public/comercial.mp4 (gerado por scripts/prep_broll.py)
  BROLL: false,
};
