# TACTICAL STRIKE MOBILE — base 3D

Protótipo inicial em Babylon.js, com cenário 3D, câmera FPS, rifle geométrico, bots-alvo, disparo por raycast e controles touch.

## Testar no iPhone
1. Publique os três arquivos `index.html`, `style.css` e `game.js` em hospedagem estática HTTPS (por exemplo, GitHub Pages ou Netlify).
2. Abra o endereço publicado no Safari.
3. Joystick esquerdo: andar. Arraste no restante da tela: mirar. Botões: disparar, recarregar e pular.

O motor Babylon.js é carregado pelo CDN, então é necessária conexão com a internet. Esta é uma primeira base jogável, não um jogo comercial completo: bots ainda não atacam e faltam multiplayer, áudio, animações, modelos finais e sistema de partidas.

## Atualização daylight v4
- Reforço de luz ambiente e luz solar, com contraste mais suave para telas móveis.
- Materiais do cenário e dos soldados com leve aumento de iluminação própria.
- Incluído o arquivo `models/soldier_rigged (1).glb` enviado separadamente.
- Versão dos arquivos CSS/JS atualizada para evitar cache antigo no GitHub Pages.
