import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }

  handleChangeFile = (e) => {
    e.preventDefault();

    // Récupérer le fichier sélectionné
    const file = this.document.querySelector('input[data-testid="file"]')
      .files[0];
    const filePath = e.target.value.split(/\\/g);
    const fileName = filePath[filePath.length - 1];
    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append("file", file);
    formData.append("email", email);

    // Envoyer le FormData via fetch
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        // Vérifiez le type MIME du fichier dans le bloc .then()
        const fileType = file.type; // Récupère le type  du fichier
        const validExtensions = ["image/jpeg", "image/jpg", "image/png"]; // Définit les types  valides
        // si le type  du fichier n'est pas valide, lancez une erreur
        if (!validExtensions.includes(fileType)) {
          throw new Error(
            "Le format du fichier n'est pas valide. Veuillez sélectionner un fichier JPG, JPEG ou PNG."
          );
        }

        // Si le type  est valide, continuez à traiter la réponse
        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = fileName; // Utilisez `fileName` pour obtenir le nom du fichier

        console.log(fileUrl);
      })
      .catch((error) => {
        // Gestion des erreurs : affiche l'erreur et vide le champ de fichier
        console.error(error);
        alert(error.message); // Affichez l'erreur sous forme d'alerte
        this.document.querySelector('input[data-testid="file"]').value = ""; // Vider le champ de fichier
      });
  };
  handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      'e.target.querySelector(`input[data-testid="datepicker"]`).value',
      e.target.querySelector(`input[data-testid="datepicker"]`).value
    );
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH["Bills"]);
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}