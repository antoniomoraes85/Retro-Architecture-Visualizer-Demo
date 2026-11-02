# Retro Architecture Visualizer — Demonstração pública

**MVP 0.1 · Ciência Atratora**

Demonstração didática para visualizar, em uma única tela, a relação conceitual entre:

- gameplay (vídeo importado ou cena geométrica fictícia);
- rastreamento de instruções Assembly por quadro;
- telemetria de posição e velocidade;
- modelo matemático discreto do movimento;
- blocos conceituais da arquitetura de um console.

## Acessar

Depois que o GitHub Actions concluir a publicação, o site estará disponível em:

https://antoniomoraes85.github.io/Retro-Architecture-Visualizer-Demo/

## Executar localmente

Basta abrir `site/index.html` em um navegador moderno. Para servir por HTTP:

```bash
cd site
python -m http.server 8000
```

Acesse http://localhost:8000.

## Como testar

1. Clique em **Reproduzir** para visualizar a demonstração fictícia.
2. Importe um vídeo MP4/WEBM.
3. Importe um CSV com as colunas `frame,x,y,vx,vy`.
4. Importe um arquivo JSONL com eventos contendo pelo menos `frame` e `asm`; campos opcionais incluem `pc`, `a`, `x_reg`, `y_reg`, `cycles` e `note`.
5. Ajuste FPS e offset para alinhar as fontes.
6. Exporte um quadro PNG ou grave até 10 segundos em WEBM, se o navegador suportar.

Os arquivos importados são processados no próprio navegador nesta versão; não são enviados a um servidor.

## Limitações científicas importantes

- A cena inicial, os endereços e as instruções exibidas sem arquivos importados são **simulados/fictícios**.
- A interface ainda não é um debugger integrado ao emulador.
- Importar vídeo, CSV e JSONL não prova, por si só, que os eventos correspondem causalmente ao movimento mostrado. A sincronização precisa ser validada.
- Os blocos CPU, WRAM, PPU, OAM e VRAM e suas setas são uma representação conceitual, não uma captura de sinais elétricos ou de barramentos reais.
- O adaptador BizHawk e a integração direta com debugger não fazem parte desta demonstração pública.

## Privacidade e propriedade intelectual

Este repositório contém somente os arquivos estáticos necessários à demonstração. O repositório de desenvolvimento principal permanece separado e privado.

O código HTML, CSS e JavaScript publicado é necessariamente acessível e inspecionável por quem visita o site. A separação protege os demais materiais do repositório privado, mas não torna secreto o código entregue ao navegador.

Nenhuma ROM, imagem, música ou outro ativo proprietário de jogos comerciais é distribuído aqui. Use apenas ROMs e materiais obtidos legalmente e não os envie ao repositório.

**Licença:** ainda não definida. A publicação deste repositório não concede, por si só, licença de reutilização ou redistribuição do código.
