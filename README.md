# ponto

Sistema de gestão de ponto baseado em arquivos de batidas.

## Como funciona

Cada linha do arquivo de entrada deve seguir a seguinte estrutura fixa:

- **9 caracteres**: identificador da batida
- **8 caracteres**: data no formato `DDMMAAAA`
- **4 caracteres**: hora no formato `HHMM`
- **12 caracteres**: matrícula do colaborador

O projeto lê o arquivo, converte cada linha em uma batida estruturada e gera um relatório agrupando horários por funcionário e data.

## Executando o projeto

1. Instale as dependências (não há dependências externas no momento, mas este passo garante a criação do diretório `node_modules`):

   ```bash
   npm install
   ```

2. Execute o relatório informando o caminho do arquivo:

   ```bash
   npm start -- SECRETARIA\ DE\ SAUDE_28102025.txt
   ```

   Utilize o caminho relativo ou absoluto do arquivo que contém as batidas.

## Testes

Execute os testes automatizados com:

```bash
npm test
```
