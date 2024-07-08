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

describe("Given I am connected as an employee", () => {
  // Définition du contexte des tests pour un employé connecté
  describe("When I am on Bills Page", () => {



    ///////////////// TESTE DEJA PRESENTS IL FALLAIT AJOUTER UN EXPECT /////////////////
    // Test pour vérifier que l'icône de factures est mise en surbrillance en vue verticale
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Simulation de l'objet `localStorage` avec le mock
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      // Définir un utilisateur de type 'Employee' dans le localStorage
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      // Création d'un élément div pour simuler le conteneur racine de l'application
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      // Initialisation du routeur pour naviguer vers la page des factures
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      // Attente que l'icône de fenêtre soit visible
      await waitFor(() => screen.getByTestId("icon-window"));
      // Récupération de l'icône de fenêtre par son test ID
      const windowIcon = screen.getByTestId("icon-window");

      // Vérification que l'élément a la classe 'active-icon'
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });




//////////////// TESTE DEJA PRESENTS////////////////////////
    // Test pour vérifier que les factures sont triées de la plus ancienne à la plus récente
    test("Then bills should be ordered from earliest to latest", () => {
      // Insertion du contenu HTML pour afficher les factures
      document.body.innerHTML = BillsUI({ data: bills });
      // Récupération de toutes les dates affichées dans l'interface utilisateur
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      // Fonction pour trier les dates en ordre décroissant
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      // Tri des dates en ordre décroissant
      const datesSorted = [...dates].sort(antiChrono);
      // Vérification que les dates affichées sont triées correctement
      expect(dates).toEqual(datesSorted);
    });
  });
});






//////////////////////////////// TESTS QUE J'AI AJOUTE ///////////////////////////




// Mock des fonctions de formatage de dates et de statut pour les tests
jest.mock("../app/format", () => ({
  formatDate: jest.fn((date) => date), // Mock de formatDate pour retourner la date brute
  formatStatus: jest.fn((status) => status), // Mock de formatStatus pour retourner le statut brut
}));

describe("Bills Class", () => {
  let bills; // Instance de la classe Bills utilisée pour les tests
  let mockStore; // Mock du store utilisé pour simuler les données des factures
  let mockOnNavigate; // Fonction mockée pour vérifier les appels de navigation
  let localStorage; // Mock de l'objet localStorage

  beforeEach(() => {
    mockOnNavigate = jest.fn(); // Création d'une fonction mockée pour vérifier les appels à onNavigate

    // Création du mock pour `localStorage` avec les méthodes `getItem` et `setItem`
    localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };

    // Création du mock du store avec une méthode `list` simulée pour retourner des données de factures
    mockStore = {
      bills: jest.fn().mockReturnValue({
        list: jest.fn().mockResolvedValue([
          { id: '1', date: '2024-01-01', status: 'pending', url: 'url1' },
          { id: '2', date: '2024-02-01', status: 'accepted', url: 'url2' },
        ]),
      }),
    };

    // Création d'une instance de la classe Bills avec le document, la fonction de navigation, le store et le localStorage
    bills = new Bills({
      document,
      onNavigate: mockOnNavigate,
      store: mockStore,
      localStorage: localStorage,
    });

    // Mock de $.fn.modal pour éviter l'ouverture réelle du modal et vérifier les appels
    $.fn.modal = jest.fn();  // Pas besoin d'ajouter une classe 'show', juste vérifier l'appel
  });

  // Test pour vérifier que `handleClickNewBill` appelle `onNavigate` avec le chemin NewBill
  test('handleClickNewBill appelle onNavigate avec le chemin NewBill', () => {
    // Création d'un bouton pour simuler l'ajout d'une nouvelle facture
    const buttonNewBill = document.createElement('button');
    buttonNewBill.setAttribute('data-testid', 'btn-new-bill');
    document.body.appendChild(buttonNewBill);

    // Ajout d'un écouteur d'événement sur le bouton pour appeler `handleClickNewBill`
    buttonNewBill.addEventListener('click', () => bills.handleClickNewBill());

    // Déclenchement du clic sur le bouton pour tester le comportement
    buttonNewBill.click();  // Déclenche l'événement

    // Vérification que `onNavigate` a été appelé avec le chemin `NewBill`
    expect(mockOnNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
  });
  
  // Test pour vérifier que `handleClickIconEye` affiche le modal avec l'image correcte pour une URL .jpeg
  test('handleClickIconEye affiche le modal avec l’image correcte (.jpeg)', () => {
    // Création d'un élément d'icône avec l'attribut 'data-bill-url' pointant vers une image .jpeg
    const icon = document.createElement('div');
    icon.setAttribute('data-testid', 'icon-eye');
    icon.setAttribute('data-bill-url', 'http://example.com/image.jpeg');
    document.body.appendChild(icon);

    // Création du modal avec un conteneur pour l'image
    const modaleFile = document.createElement('div');
    modaleFile.setAttribute('id', 'modaleFile');
    modaleFile.classList.add('modal');
    const modalBody = document.createElement('div');
    modalBody.classList.add('modal-body');
    modaleFile.appendChild(modalBody);
    document.body.appendChild(modaleFile);

    // Appel de la méthode handleClickIconEye avec l'icône
    bills.handleClickIconEye(icon);

    // Vérification que la méthode modal a été appelée avec 'show'
    expect($.fn.modal).toHaveBeenCalledWith('show');

    // Vérification que l'image dans le modal a le bon URL et attribut 'alt'
    const imgInModal = $('#modaleFile').find('img');
    expect(imgInModal.attr('src')).toBe('http://example.com/image.jpeg');
    expect(imgInModal.attr('alt')).toBe('Bill');
  });

  // Test pour vérifier que `handleClickIconEye` affiche le modal avec l'image correcte pour une URL .jpg
  test('handleClickIconEye affiche le modal avec l’image correcte (.jpg)', () => {
    // Création d'un élément d'icône avec l'attribut 'data-bill-url' pointant vers une image .jpg
    const icon = document.createElement('div');
    icon.setAttribute('data-testid', 'icon-eye');
    icon.setAttribute('data-bill-url', 'http://example.com/image.jpg');
    document.body.appendChild(icon);
  
    // Création du modal avec un conteneur pour l'image
    const modaleFile = document.createElement('div');
    modaleFile.setAttribute('id', 'modaleFile');
    modaleFile.classList.add('modal');
    const modalBody = document.createElement('div');
    modalBody.classList.add('modal-body');
    modaleFile.appendChild(modalBody);
    document.body.appendChild(modaleFile);
  
    // Appel de la méthode handleClickIconEye avec l'icône
    bills.handleClickIconEye(icon);
  
    // Vérification que la méthode modal a été appelée avec 'show'
    expect($.fn.modal).toHaveBeenCalledWith('show');
  
    // Vérification que l'image dans le modal a le bon URL et attribut 'alt'
    const imgInModal = $('#modaleFile').find('img');
    expect(imgInModal.attr('src')).toBe('http://example.com/image.jpg');
    expect(imgInModal.attr('alt')).toBe('Bill');
  });

  // Test pour vérifier que `handleClickIconEye` affiche le modal avec l'image correcte pour une URL .png
  test('handleClickIconEye affiche le modal avec l’image correcte (.png)', () => {
    // Création d'un élément d'icône avec l'attribut 'data-bill-url' pointant vers une image .png
    const icon = document.createElement('div');
    icon.setAttribute('data-testid', 'icon-eye');
    icon.setAttribute('data-bill-url', 'http://example.com/image.png');
    document.body.appendChild(icon);

    // Création du modal avec un conteneur pour l'image
    const modaleFile = document.createElement('div');
    modaleFile.setAttribute('id', 'modaleFile');
    modaleFile.classList.add('modal');
    const modalBody = document.createElement('div');
    modalBody.classList.add('modal-body');
    modaleFile.appendChild(modalBody);
    document.body.appendChild(modaleFile);

    // Appel de la méthode handleClickIconEye avec l'icône
    bills.handleClickIconEye(icon);

    // Vérification que la méthode modal a été appelée avec 'show'
    expect($.fn.modal).toHaveBeenCalledWith('show');

    // Vérification que l'image dans le modal a le bon URL et attribut 'alt'
    const imgInModal = $('#modaleFile').find('img');
    expect(imgInModal.attr('src')).toBe('http://example.com/image.png');
    expect(imgInModal.attr('alt')).toBe('Bill');
  });

  // Test pour vérifier que `getBills` appelle `store.bills().list()` et formate les données
  test("getBills appelle store.bills().list() et formate les données", async () => {
    // Appeler getBills pour tester sa fonctionnalité
    await bills.getBills();

    // Vérifiez que store.bills() a été appelé
    expect(mockStore.bills).toHaveBeenCalled();

    // Vérifiez que formatDate et formatStatus ont été appelés avec les bonnes valeurs
    expect(formatDate).toHaveBeenCalledWith("2024-01-01");
    expect(formatStatus).toHaveBeenCalledWith("pending");
  });

  // Test pour vérifier que `getBills` retourne les factures formatées correctement
  test("getBills retourne les factures formatées correctement", async () => {
    // Appel de la méthode getBills et récupération du résultat
    const result = await bills.getBills();

    // Vérification que le résultat correspond aux données de factures attendues
    expect(result).toEqual([
      { id: "1", date: "2024-01-01", status: "pending", url: "url1" },
      { id: "2", date: "2024-02-01", status: "accepted", url: "url2" },
    ]);
  });

  // Test pour vérifier que `getBills` gère les erreurs lors du formatage de la date
  test("getBills gère les erreurs lors du formatage de la date", async () => {
    // Mock du store avec une date invalide pour vérifier la gestion des erreurs
    mockStore = {
      bills: jest.fn().mockReturnValue({
        list: jest.fn().mockResolvedValue([
          { id: "1", date: "invalid-date", status: "pending", url: "url1" },
          { id: "2", date: "2024-02-01", status: "accepted", url: "url2" },
        ]),
      }),
    };

    // Réinitialisation de l'instance de la classe Bills avec le nouveau mock
    bills = new Bills({
      document: document,
      onNavigate: jest.fn(),
      store: mockStore,
      localStorage: localStorage,
    });

    // Appel de la méthode getBills et récupération du résultat
    const result = await bills.getBills();

    // Vérification que le résultat contient les factures avec une date invalide
    expect(result).toEqual([
      { id: "1", date: "invalid-date", status: "pending", url: "url1" },
      { id: "2", date: "2024-02-01", status: "accepted", url: "url2" },
    ]);
  });
});


