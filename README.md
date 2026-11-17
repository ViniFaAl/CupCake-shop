# 🧁 Cupcake Shop

## 📖 Sobre o projeto

O **Cupcake Shop** é um projeto acadêmico desenvolvido para a disciplina de **Projeto Integrador Transdisciplinar em Engenharia de Software II**, da Universidade Cruzeiro do Sul.

O objetivo é desenvolver uma loja virtual de cupcakes com uma interface moderna, intuitiva e responsiva, facilitando a navegação e a experiência de compra dos usuários.

O projeto integra frontend, backend e banco de dados, permitindo simular o processo de compra e o gerenciamento de pedidos.

## 🛠️ Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Python
- SQLite
- Git e GitHub

## ✨ Funcionalidades

- Catálogo de cupcakes com imagens, nomes e preços.
- Interface responsiva para dispositivos móveis e computadores.
- Menu de navegação adaptado para dispositivos móveis.
- Carrinho lateral com armazenamento local.
- Mensagem de confirmação ao adicionar produtos ao carrinho.
- Finalização de pedidos (checkout).
- Opções de retirada e entrega.
- Simulação de pagamento.
- Armazenamento dos pedidos em banco de dados SQLite.
- Painel administrativo para consultar pedidos e atualizar seus status.
- Acompanhamento do status dos pedidos pelo cliente, utilizando o número do pedido.

## 🌐 Acesso ao projeto

**Repositório no GitHub:**

https://github.com/ViniFaAl/CupCake-shop

**Visualização da interface pelo GitHub Pages:**

https://vinifaal.github.io/CupCake-shop/

**Importante:** o GitHub Pages permite visualizar a interface do projeto, mas não executa o servidor Python nem o banco de dados SQLite.

Para utilizar as funcionalidades completas, como finalizar pedidos, administrar compras e acompanhar seus status, é necessário executar o projeto localmente.

## 💻 Como executar o projeto

1. Faça o download ou clone o repositório.
2. Abra a pasta do projeto no Visual Studio Code.
3. Verifique se o Python está instalado.
4. Abra o terminal na pasta principal do projeto.
5. Execute o comando:

   `python server.py`

6. Abra o navegador e acesse:

   http://127.0.0.1:8000/index.html

**Observação:** mantenha o servidor Python em execução durante a utilização do sistema.

## 🔐 Painel administrativo

O Cupcake Shop possui um painel administrativo para consultar os pedidos registrados e atualizar seus status.

### Como acessar

1. Inicie o servidor utilizando `python server.py`.
2. Abra o navegador.
3. Acesse:

   http://127.0.0.1:8000/admin.html

4. Informe a chave de acesso de demonstração:

   `demo123`

5. Consulte os pedidos registrados e atualize seus status conforme necessário.

**Atenção:** a chave de acesso é utilizada exclusivamente para demonstração acadêmica. Esse mecanismo não representa uma autenticação segura para utilização em produção.

## 📦 Acompanhamento de pedidos

O sistema permite que o cliente consulte o andamento de uma compra utilizando o número de identificação do pedido.

Para acessar:

http://127.0.0.1:8000/acompanhar.html

### Como funciona

1. O cliente finaliza um pedido.
2. O sistema apresenta um número de identificação.
3. O administrador consulta o pedido no painel administrativo.
4. O administrador atualiza o status.
5. O cliente informa o número do pedido na página de acompanhamento.
6. O sistema apresenta as informações e o status atualizado.

## 🗄️ Banco de dados

O projeto utiliza **SQLite** para armazenar os pedidos realizados.

O arquivo `cupcake_shop.db` é utilizado localmente e não é enviado ao GitHub, conforme as configurações do `.gitignore`.

Os dados de pedidos gerados durante os testes locais não acompanham o código-fonte publicado.

## 🧪 Testes e documentação

Foram realizados testes funcionais locais para verificar as principais funcionalidades do Cupcake Shop.

Os testes foram organizados em cinco grupos:

1. Carrinho de compras.
2. Finalização de pedidos.
3. Painel administrativo.
4. Acompanhamento de pedidos.
5. Validações e tratamento de erros.

Ao todo, foram realizadas **25 verificações funcionais**, com resultados positivos nos cenários testados pelo desenvolvedor.

Os relatórios estão disponíveis na pasta `documentacao` do repositório.

O projeto também possui um relatório de avaliação de usabilidade com exemplos simulados, identificados como tal. Essas simulações não substituem avaliações realizadas por usuários externos.

## 🎓 Objetivo acadêmico

Aplicar conhecimentos relacionados a:

- Engenharia de Software.
- Desenvolvimento web.
- Interface e usabilidade.
- Desenvolvimento frontend e backend.
- Persistência de dados.
- Testes funcionais.
- Documentação de software.
- Controle de versão com Git e GitHub.

## 📌 Status do projeto

**Protótipo acadêmico desenvolvido e testado localmente.**

As principais funcionalidades foram implementadas para fins de demonstração e aprendizagem.

O sistema utiliza pagamentos simulados e não está preparado para operações comerciais reais.