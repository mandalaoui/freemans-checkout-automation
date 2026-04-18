export const selectors = {
    // Used for automated guest checkout when user is not logged in
    guestCheckoutButton: "#registerLink",
    firstNameInput: "#FirstName",

    // These selectors ensure resilience across changing form layouts and delivery flows
    findAddressButton: "#searchAddressImageButton",
    email: "#Email",
    addressSelect: "#addressSelect",
    addressSummary: ".adr"
};
