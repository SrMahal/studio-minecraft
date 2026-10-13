# Studio Minecraft · Servidor Mahal

Website em HTML, CSS e JavaScript para conexão, instalação de mods e ajuda do Servidor Mahal, com fundação de banco StudioCraft para a infraestrutura Threeebs.

## Banco StudioCraft

O banco do projeto recebe migrations em `database/migrations/`, fora de `public/`,
e usa a conexão PDO `config/database.php` com as variáveis fornecidas pela Threeebs.
Esta primeira etapa cria jogadores vinculados por UUID ao parceiro Threeebs e
credenciais exclusivas para o jogo. Nick, e-mail e vínculo de conta são únicos;
as contas nascem pendentes. A senha principal da Threeebs não é copiada.

Veja [schema e aplicação pela plataforma](database/README.md) e
[contrato da integração seguinte](docs/THREEEBS_INTEGRATION.md).
O website continua estático nesta entrega: login, consulta de parceiro, envio de
e-mail e autenticação no Minecraft serão implementados nas próximas etapas.

## Navegação

Cada página mostra uma seção por vez, com progresso e botões **Anterior** e **Próxima seção**. Na última seção, o botão leva ao próximo destino: guia de ajuda ou conexão ao servidor.

- `/`: apresentação, conexão, mods e ajuda.
- `/pages/mods/`: download, perfil Fabric, pasta, arquivo, áudio e checklist.
- `/pages/ajuda/`: apresentação, F3 + P, Alt + Tab, janelas, checklist e dúvidas.

Os links `/#conectar`, `/pages/mods/#instalar` e `/pages/ajuda/#passos` continuam disponíveis. Os números no topo permitem saltar diretamente para qualquer seção. Voltar/avançar do navegador acompanha a seção selecionada.

O checklist é mantido durante a sessão do navegador. Os botões permanecem visíveis na base da página. Em telas pequenas, texto ampliado ou dúvidas expandidas, o conteúdo pode rolar dentro da seção para permanecer legível. Sem JavaScript, as seções ficam visíveis e podem ser acessadas pelos links no topo.

## Identidade

Paleta e famílias tipográficas de [threeebs/threeebs-identity](https://github.com/threeebs/threeebs-identity):

- `public/assets/css/threeebs-tokens.css`: tokens originais de `design-system/src/tokens.css`.
- `public/assets/img/threeebs-symbol.png`: símbolo oficial de `app/public/assets/image/logo/logo-symbol-brand.png`.
- `public/assets/css/styles.css`: layout específico do Studio Minecraft.

Os ativos estão no próprio website; a apresentação não depende de carregar CSS ou imagens de outro domínio. As fontes usam as alternativas locais definidas pelos tokens oficiais.

## Leitura e acessibilidade

- Texto principal de 20 a 24 px na configuração padrão, com metadados a partir de 16 px. A altura da tela não reduz as fontes.
- Controles **A− / A+** oferecem 100%, 125% e 150%. Tema e tamanho são salvos no navegador e aplicados antes da primeira pintura nas três páginas.
- Modo claro e escuro com cores semânticas de maior contraste. Na primeira visita, o tema acompanha a preferência do sistema.
- Ícones SVG locais acompanham rótulos de texto. Controles de leitura têm área mínima de 44 × 48 px (botões principais de 56 px de altura), foco visível e navegação por teclado.
- A opção **Sem animações** desativa transições e movimentos de clique. A preferência de movimento reduzido do sistema sempre é respeitada.
- As transições de seção duram 240 ms; não atrasam o foco nem a troca de conteúdo.
- O conteúdo da seção pode rolar internamente quando houver texto ampliado, FAQ aberta ou pouco espaço. Isso mantém as letras grandes e as ações acessíveis. Em janelas com até 520 px de altura útil, ou com até 360 px de largura e texto a 150%, como ao usar zoom forte, a página permite rolagem vertical para preservar o acesso ao conteúdo.
- `public/assets/js/preferences.js` inicializa as preferências de leitura. O site continua navegável com armazenamento bloqueado ou JavaScript desativado.

## Executar localmente

```sh
python3 -m http.server 8080 --directory public
```

Abra `http://localhost:8080`. A hospedagem deve apontar sua raiz para `public/`.

A versão e os endereços apresentados são configurações editoriais do servidor, não uma consulta de disponibilidade em tempo real. O tutorial F3 + P é específico do Minecraft Java e não altera o jogo automaticamente.

