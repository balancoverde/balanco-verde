# BALANÇO VERDE

Plataforma web responsiva para estudo, simulação e aplicação de balanços de massa em processos industriais.

## Tecnologias
- React + Vite
- CSS responsivo
- SVG para fluxograma
- LocalStorage para persistência do protótipo
- Álgebra linear em JavaScript para análise de posto, consistência e grau de liberdade
- `lucide-react` para ícones

## Como abrir no VS Code

1. Extraia o ZIP.
2. Abra a pasta `Balanco-Verde` no VS Code.
3. Abra o terminal integrado.
4. Execute:

```bash
npm install
npm run dev
```

5. Abra o endereço mostrado pelo Vite no navegador.

Para produção:

```bash
npm run build
npm run preview
```

## O que já funciona
- Navegação entre as seções.
- Criar processo do zero.
- Biblioteca de equipamentos.
- Adição/remoção de equipamentos e correntes.
- Conexão de correntes entre equipamentos.
- Edição de propriedades.
- Componentes personalizados.
- Variáveis e equações.
- Análise de posto de matriz e grau de liberdade.
- Classificação em determinado, subespecificado, superespecificado/redundante e inconsistente.
- Resolução de sistemas lineares determinados.
- Calculadora independente.
- Exemplos.
- Desafios.
- Indicadores básicos de eficiência material.
- Salvamento local, duplicação e exclusão de processos.
- Relatório com opção de impressão/salvar como PDF pelo navegador.
- Área de IA preparada para integração futura, sem chat falso.

## Observações científicas
A conversão de unidades incluída é propositalmente conservadora e usa fatores didáticos para uma base interna. Antes de misturar grandezas diferentes (massa, molar e volumétrica), a grandeza física e a densidade devem ser definidas. A arquitetura está preparada para ampliar essa validação.

A análise de sustentabilidade é uma análise de eficiência material baseada nas correntes do processo e **não representa uma Avaliação de Ciclo de Vida (ACV)**.

## Desenvolvedores
Bruna Isabelly Gouveia Montenegro  
Andrey Oliveira de Souza  

Parceria: IFPB — Campus Campina Grande.
