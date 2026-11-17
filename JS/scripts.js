
"use strict";

// ========================================
// CUPCAKE SHOP - MENU HAMBÚRGUER
// ========================================

// Seleciona os elementos do HTML
const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector("#main-navigation");

// Verifica se os elementos existem
if (menuButton && navigation) {

  // Abre ou fecha o menu ao clicar no botão
  menuButton.addEventListener("click", function () {

    // Verifica se o menu está fechado
    const menuEstaFechado = navigation.hidden;

    // Alterna a visibilidade do menu
    navigation.hidden = !menuEstaFechado;

    // Atualiza a informação de acessibilidade
    menuButton.setAttribute(
      "aria-expanded",
      String(menuEstaFechado)
    );

    // Atualiza o ícone e a descrição do botão
    menuButton.textContent = menuEstaFechado ? "✕" : "☰";

    menuButton.setAttribute(
      "aria-label",
      menuEstaFechado ? "Fechar menu" : "Abrir menu"
    );

  });

  // Fecha o menu ao clicar em um link
  const navigationLinks = navigation.querySelectorAll("a");

  navigationLinks.forEach(function (link) {

    link.addEventListener("click", function () {

      navigation.hidden = true;

      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Abrir menu");
      menuButton.textContent = "☰";

    });

  });

}
