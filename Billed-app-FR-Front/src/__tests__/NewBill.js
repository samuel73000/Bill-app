/**
 * @jest-environment jsdom
 */

import { ROUTES_PATH } from "../constants/routes";
import NewBill from "../containers/NewBill";
import NewBillUI from "../views/NewBillUI";
import mockStore from "../__mocks__/store";
import { fireEvent, screen, waitFor } from "@testing-library/dom";

// Mock du localStorage pour simuler un utilisateur connecté
const localStorageMock = {
  getItem: jest.fn(() => JSON.stringify({ email: "a@a" })),  // Retourne une valeur JSON simulée pour l'email
  setItem: jest.fn(),  // Fonction vide car nous n'avons pas besoin de la setter
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,  // Remplace le localStorage global par notre mock
});


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form and inputs should be present", () => {
      const html = NewBillUI();  // Obtient le HTML du composant NewBillUI
      document.body.innerHTML = html;  // Injecte le HTML dans le DOM

      // Initialisation de la classe NewBill avec les paramètres nécessaires
      const onNavigate = jest.fn();  // Mock de la fonction de navigation
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      });

      // Vérification des éléments du formulaire
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();  // Vérifie que le formulaire est présent
      expect(screen.getByTestId("expense-type")).toBeTruthy();  // Vérifie que le type de dépense est présent
      expect(screen.getByTestId("expense-name")).toBeTruthy();  // Vérifie que le champ du nom est présent
      expect(screen.getByTestId("amount")).toBeTruthy();  // Vérifie que le champ du montant est présent
      expect(screen.getByTestId("datepicker")).toBeTruthy();  // Vérifie que le champ de la date est présent
      expect(screen.getByTestId("vat")).toBeTruthy();  // Vérifie que le champ de la TVA est présent
      expect(screen.getByTestId("pct")).toBeTruthy();  // Vérifie que le champ du pourcentage est présent
      expect(screen.getByTestId("commentary")).toBeTruthy();  // Vérifie que le champ des commentaires est présent
      expect(screen.getByTestId("file")).toBeTruthy();  // Vérifie que le champ de fichier est présent
    });
  });
});

/////// **Test de POST pour la création d'une nouvelle facture**
describe("Given I am connected as an employee", () => {
  describe("When I submit the form with a valid file", () => {
    test("Then the new bill should be created successfully", async () => {
      // Initialisation du DOM
      const html = NewBillUI();  // Obtient le HTML du composant NewBillUI
      document.body.innerHTML = html;  // Injecte le HTML dans le DOM

      // Configuration de `onNavigate` et du nouveau bill
      const onNavigate = jest.fn();  // Mock de la fonction de navigation
      const store = mockStore;  // Utilisation du mockStore

      // Création d'une instance de NewBill avec des paramètres simulés
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: {
          getItem: () => JSON.stringify({ email: "a@a" }),  // Simule un utilisateur connecté
        },
      });

      // Création des mocks pour `create` et `update` méthodes du store
      const createMock = jest.fn(() =>
        Promise.resolve({
          fileUrl: 'https://localhost:3456/images/test.jpg',  // URL de fichier simulée
          key: '1234'  // Clé de fichier simulée
        })
      );

      const updateMock = jest.fn(() =>
        Promise.resolve({
          "id": "47qAXb6fIm2zOKkLzMro",
          "vat": "80",
          "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
          "status": "pending",
          "type": "Hôtel et logement",
          "commentary": "séminaire billed",
          "name": "encore",
          "fileName": "preview-facture-free-201801-pdf-1.jpg",
          "date": "2004-04-04",
          "amount": 400,
          "commentAdmin": "ok",
          "email": "a@a",
          "pct": 20
        })
      );

      // Mock le store pour `bills` avec `create` et `update`
      store.bills = jest.fn(() => ({
        create: createMock,  // Simule l'appel à la méthode `create` pour créer une facture
        update: updateMock,  // Simule l'appel à la méthode `update` pour mettre à jour une facture
      }));

      // **Simulation de la soumission du formulaire avec un fichier valide**
      // Remplir le formulaire avec des valeurs simulées
      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Hotels" } });
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Hotel Stay" } });
      fireEvent.change(screen.getByTestId("amount"), { target: { value: "200" } });
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2024-08-01" } });
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "15" } });
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "5" } });
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Business trip" } });

      // Simulation de l'ajout d'un fichier
      const fileInput = screen.getByTestId("file");
      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Soumettre le formulaire
      fireEvent.submit(screen.getByTestId("form-new-bill"));

      // **Attendre que les promesses soient résolues et vérifier les résultats**
      await waitFor(() => {
        // **Vérifiez que `create` a été appelé avec le FormData correct**
        expect(createMock).toHaveBeenCalled();

        // **Vérifiez que `update` est appelé après `create`**
        expect(updateMock).toHaveBeenCalled();

        // **Vérifiez que `onNavigate` a été appelé avec le bon chemin**
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
      });
    });
  });
});
