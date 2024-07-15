/**
 * @jest-environment jsdom
 */

import { ROUTES_PATH } from "../constants/routes";
import NewBill from "../containers/NewBill";
import NewBillUI from "../views/NewBillUI";
import mockStore from "../__mocks__/store";
import { fireEvent, screen, waitFor } from "@testing-library/dom";


// Mock du localStorage
const localStorageMock = {
  getItem: jest.fn(() => JSON.stringify({ email: "a@a" })),
  setItem: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form and inputs should be present", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Initialisation de la classe NewBill
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      });

      // Vérification des éléments du formulaire
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      expect(screen.getByTestId("expense-type")).toBeTruthy();
      expect(screen.getByTestId("expense-name")).toBeTruthy();
      expect(screen.getByTestId("amount")).toBeTruthy();
      expect(screen.getByTestId("datepicker")).toBeTruthy();
      expect(screen.getByTestId("vat")).toBeTruthy();
      expect(screen.getByTestId("pct")).toBeTruthy();
      expect(screen.getByTestId("commentary")).toBeTruthy();
      expect(screen.getByTestId("file")).toBeTruthy();
    });
  });
});





describe("Given I am connected as an employee", () => {
  describe("When I submit the form with a valid file", () => {
    test("Then the new bill should be created successfully", async () => {
      // Initialisation du DOM
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Configuration de `onNavigate` et du nouveau bill
      const onNavigate = jest.fn();
      const store = mockStore;  // Utilisation du mockStore

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: {
          getItem: () => JSON.stringify({ email: "a@a" }),  // Simulez un utilisateur connecté
        },
      });

      // Création des mocks pour `create` et `update` méthodes du store
      const createMock = jest.fn(() =>
        Promise.resolve({
          fileUrl: 'https://localhost:3456/images/test.jpg',
          key: '1234'
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
        create: createMock,
        update: updateMock,  // Assurez-vous que `update` est bien défini
      }));

      // Remplir le formulaire et soumettre
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

      // Attendre que les promesses soient résolues
      await waitFor(() => {
        expect(createMock).toHaveBeenCalled();  // Vérifiez que `create` a été appelé
        expect(updateMock).toHaveBeenCalled();  // Vérifiez que `update` est appelé après `create`
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);  // Vérifiez que `onNavigate` est appelé avec le bon paramètre
      });
    });
  });
});