// Importation des fonctions nécessaires depuis `@testing-library/dom` pour les tests
import { screen, waitFor } from "@testing-library/dom";
// Importation du composant UI des factures
import BillsUI from "../views/BillsUI.js";
// Importation des données de factures fictives pour les tests
import { bills } from "../fixtures/bills.js";
// Importation des chemins de routes pour la navigation
import { ROUTES_PATH } from "../constants/routes.js";

// Importation d'un mock de localStorage utilisé pour tester le comportement de stockage
import { localStorageMock } from "../__mocks__/localStorage.js";
// Importation de la classe Bills pour les tests
import Bills from "../containers/Bills.js";
// Importation des fonctions de formatage pour les dates et le statut
import { formatDate, formatStatus } from "../app/format.js";
// Importation des extensions Jest pour les assertions DOM
import "@testing-library/jest-dom";
import router from "../app/Router.js";

// Importation de jQuery pour manipuler le DOM et mocker Bootstrap Modal
import $ from "jquery";
// Assurez-vous que jQuery est global pour que le mock de Bootstrap Modal fonctionne
global.$ = $;
// Mock de la méthode `.modal()` de jQuery pour éviter l'ouverture réelle du modal
$.fn.modal = jest.fn();

describe("Étant donné que je suis connecté en tant qu'employé", () => {
  describe("Quand je suis sur la page des factures", () => {
    test("Alors l'icône de factures dans la disposition verticale doit être mise en surbrillance", async () => {
      // GIVEN : Un utilisateur est connecté en tant qu'employé
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // WHEN : Je suis sur la page des factures
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");

      //////////// LE EXPECT AJOUTÉ PAR MOI ////////////////
      // THEN : L'icône de fenêtre doit être mise en surbrillance
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    test("Alors les factures doivent être triées de la plus ancienne à la plus récente", () => {
      // GIVEN : La liste des factures est affichée
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);

      // WHEN : Je vérifie l'ordre des dates
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);

      // THEN : Les dates doivent être triées de la plus ancienne à la plus récente
      expect(dates).toEqual(datesSorted);
    });
  });
});

//////////////////////////////// TESTS QUE J'AI AJOUTÉS ///////////////////////////

jest.mock("../app/format", () => ({
  formatDate: jest.fn((date) => date),
  formatStatus: jest.fn((status) => status),
}));

describe("Étant donné que je suis sur la page des factures", () => {
  let bills;
  let mockStore;
  let mockOnNavigate;
  let localStorage;

  beforeEach(() => {
    mockOnNavigate = jest.fn();

    localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };

    mockStore = {
      bills: jest.fn().mockReturnValue({
        list: jest.fn().mockResolvedValue([
          { id: "1", date: "2024-01-01", status: "pending", url: "url1" },
          { id: "2", date: "2024-02-01", status: "accepted", url: "url2" },
        ]),
      }),
    };

    bills = new Bills({
      document,
      onNavigate: mockOnNavigate,
      store: mockStore,
      localStorage: localStorage,
    });

    $.fn.modal = jest.fn();
  });

  test("Étant donné que je clique sur le bouton Nouvelle Facture, quand le bouton est cliqué, alors il devrait naviguer vers la page NewBill", () => {
    // GIVEN : Un bouton pour ajouter une nouvelle facture est présent
    const buttonNewBill = document.createElement("button");
    buttonNewBill.setAttribute("data-testid", "btn-new-bill");
    document.body.appendChild(buttonNewBill);

    buttonNewBill.addEventListener("click", () => bills.handleClickNewBill());

    // WHEN : Le bouton est cliqué
    buttonNewBill.click();

    // THEN : La fonction `onNavigate` doit être appelée avec le chemin `NewBill`
    expect(mockOnNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
  });

  test("Étant donné que je clique sur une icône Œil avec une URL d'image .jpeg, quand l'icône est cliquée, alors le modal doit afficher l'image correcte pour .jpeg", () => {
    // GIVEN : Un élément d'icône avec une URL d'image .jpeg est présent
    const icon = document.createElement("div");
    icon.setAttribute("data-testid", "icon-eye");
    icon.setAttribute("data-bill-url", "http://example.com/image.jpeg");
    document.body.appendChild(icon);

    const modaleFile = document.createElement("div");
    modaleFile.setAttribute("id", "modaleFile");
    modaleFile.classList.add("modal");
    const modalBody = document.createElement("div");
    modalBody.classList.add("modal-body");
    modaleFile.appendChild(modalBody);
    document.body.appendChild(modaleFile);

    // WHEN : Je clique sur l'icône
    bills.handleClickIconEye(icon);

    // THEN : Le modal doit afficher l'image correcte avec l'URL et l'attribut 'alt'
    expect($.fn.modal).toHaveBeenCalledWith("show");
    const imgInModal = $("#modaleFile").find("img");
    expect(imgInModal.attr("src")).toBe("http://example.com/image.jpeg");
    expect(imgInModal.attr("alt")).toBe("Bill");
  });

  test("Étant donné que je clique sur une icône Œil avec une URL d'image .jpg, quand l'icône est cliquée, alors le modal doit afficher l'image correcte pour .jpg", () => {
    // GIVEN : Un élément d'icône avec une URL d'image .jpg est présent
    const icon = document.createElement("div");
    icon.setAttribute("data-testid", "icon-eye");
    icon.setAttribute("data-bill-url", "http://example.com/image.jpg");
    document.body.appendChild(icon);

    const modaleFile = document.createElement("div");
    modaleFile.setAttribute("id", "modaleFile");
    modaleFile.classList.add("modal");
    const modalBody = document.createElement("div");
    modalBody.classList.add("modal-body");
    modaleFile.appendChild(modalBody);
    document.body.appendChild(modaleFile);

    // WHEN : Je clique sur l'icône
    bills.handleClickIconEye(icon);

    // THEN : Le modal doit afficher l'image correcte avec l'URL et l'attribut 'alt'
    expect($.fn.modal).toHaveBeenCalledWith("show");
    const imgInModal = $("#modaleFile").find("img");
    expect(imgInModal.attr("src")).toBe("http://example.com/image.jpg");
    expect(imgInModal.attr("alt")).toBe("Bill");
  });

  test("Étant donné que je clique sur une icône Œil avec une URL d'image .png, quand l'icône est cliquée, alors le modal doit afficher l'image correcte pour .png", () => {
    // GIVEN : Un élément d'icône avec une URL d'image .png est présent
    const icon = document.createElement("div");
    icon.setAttribute("data-testid", "icon-eye");
    icon.setAttribute("data-bill-url", "http://example.com/image.png");
    document.body.appendChild(icon);

    const modaleFile = document.createElement("div");
    modaleFile.setAttribute("id", "modaleFile");
    modaleFile.classList.add("modal");
    const modalBody = document.createElement("div");
    modalBody.classList.add("modal-body");
    modaleFile.appendChild(modalBody);
    document.body.appendChild(modaleFile);

    // WHEN : Je clique sur l'icône
    bills.handleClickIconEye(icon);

    // THEN : Le modal doit afficher l'image correcte avec l'URL et l'attribut 'alt'
    expect($.fn.modal).toHaveBeenCalledWith("show");
    const imgInModal = $("#modaleFile").find("img");
    expect(imgInModal.attr("src")).toBe("http://example.com/image.png");
    expect(imgInModal.attr("alt")).toBe("Bill");
  });

  test("Étant donné que j'appelle la méthode getBills, quand getBills est appelée, alors elle doit appeler store.bills().list() et formater les données", async () => {
    // WHEN : Appeler getBills pour tester sa fonctionnalité
    await bills.getBills();

    // THEN : Vérifiez que store.bills() a été appelé
    expect(mockStore.bills).toHaveBeenCalled();

    // THEN : Vérifiez que formatDate et formatStatus ont été appelés avec les bonnes valeurs
    expect(formatDate).toHaveBeenCalledWith("2024-01-01");
    expect(formatStatus).toHaveBeenCalledWith("pending");
  });

  test("Étant donné que j'appelle la méthode getBills, quand getBills est appelée, alors elle doit retourner les factures correctement formatées", async () => {
    // WHEN : Appel de la méthode getBills et récupération du résultat
    const result = await bills.getBills();

    // THEN : Vérification que le résultat correspond aux données de factures attendues
    expect(result).toEqual([
      { id: "1", date: "2024-01-01", status: "pending", url: "url1" },
      { id: "2", date: "2024-02-01", status: "accepted", url: "url2" },
    ]);
  });

  test("Étant donné que j'appelle la méthode getBills avec une date invalide, quand getBills est appelée, alors elle doit gérer les erreurs de formatage de la date", async () => {
    // GIVEN : Le mock du store contient une date invalide
    mockStore = {
      bills: jest.fn().mockReturnValue({
        list: jest.fn().mockResolvedValue([
          { id: "1", date: "invalid-date", status: "pending", url: "url1" },
          { id: "2", date: "2024-02-01", status: "accepted", url: "url2" },
        ]),
      }),
    };

    bills = new Bills({
      document: document,
      onNavigate: jest.fn(),
      store: mockStore,
      localStorage: localStorage,
    });

    // WHEN : Appel de la méthode getBills et récupération du résultat
    const result = await bills.getBills();

    // THEN : Vérification que le résultat contient les factures avec une date invalide
    expect(result).toEqual([
      { id: "1", date: "invalid-date", status: "pending", url: "url1" },
      { id: "2", date: "2024-02-01", status: "accepted", url: "url2" },
    ]);
  });
});
