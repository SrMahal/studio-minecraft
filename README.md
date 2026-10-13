# Studio Minecraft · Servidor Mahal

Website estático em HTML, CSS e JavaScript para conexão, instalação de mods e ajuda do Servidor Mahal.

## Navegação

Cada página mostra uma seção por vez, com progresso e botões **Anterior** e **Próxima seção**. Na última seção, o botão leva ao próximo destino: guia de ajuda ou conexão ao servidor.

- `/`: apresentação, conexão, mods e ajuda.
- `/pages/mods/`: download, perfil Fabric, pasta, arquivo, áudio e checklist.
- `/pages/ajuda/`: apresentação, F3 + P, Alt + Tab, janelas, checklist e dúvidas.

Os links `/#conectar`, `/pages/mods/#instalar` e `/pages/ajuda/#passos` continuam disponíveis. Os números no topo permitem saltar diretamente para qualquer seção. Voltar/avançar do navegador acompanha a seção selecionada.

O checklist é mantido durante a sessão do navegador. Os botões permanecem visíveis na base da página. Em telas pequenas, texto ampliado ou dúvidas expandidas, o conteúdo pode rolar dentro da seção para permanecer legível. Sem JavaScript, as seções ficam visíveis e podem ser acessadas pelos links no topo.

## Identidade

Paleta e famílias tipográficas de [threeebs/threeebs-identity](https://github.com/threeebs/threeebs-identity):

- `public/assets/css/threeebs-tokens.css`: cópia dos tokens de `design-system/src/tokens.css`.
- `public/assets/img/threeebs-symbol.png`: símbolo oficial de `app/public/assets/image/logo/logo-symbol-brand.png`.
- `public/assets/css/styles.css`: layout específico do Studio Minecraft.

Os ativos estão no próprio website; a apresentação não depende de carregar CSS ou imagens de outro domínio. As fontes usam as alternativas locais definidas pelos tokens oficiais.

## Executar localmente

```sh
python3 -m http.server 8080 --directory public
```

Abra `http://localhost:8080`. A hospedagem deve apontar sua raiz para `public/`.

A versão e os endereços apresentados são configurações editoriais do servidor, não uma consulta de disponibilidade em tempo real. O tutorial F3 + P é específico do Minecraft Java e não altera o jogo automaticamente.
