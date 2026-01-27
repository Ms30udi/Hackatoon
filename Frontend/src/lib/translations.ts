/**
 * Translations Module
 * 
 * Contains all localized text strings for the application.
 * Supports French (fr) and English (en) languages.
 * 
 * Structure mirrors the UI components that consume these strings,
 * organized by feature area (header, forms, validation, etc.).
 * 
 * @module lib/translations
 */

/** Supported language codes */
export type Language = 'fr' | 'en';

/**
 * Translation dictionary containing all UI strings
 * 
 * Organized by language with identical structure for each language.
 * All keys must exist in both language objects.
 */
export const translations = {
  // French translations
  fr: {
    // Header section
    siteName: 'Services Électricité',
    tagline: 'Portail de services intelligents',

    // Language selector
    language: 'Langue',
    french: 'Français',
    english: 'English',

    // Main page headings
    mainHeading: 'Comment pouvons-nous vous aider ?',
    mainSubheading: 'Sélectionnez le type de demande qui correspond à votre situation. Nous adapterons le formulaire à vos besoins.',

    // Request type cards
    requestTypes: {
      newContract: {
        title: 'Nouveau contrat',
        description: 'Souscrire un contrat d\'électricité pour votre logement ou local professionnel',
      },
      modifyContract: {
        title: 'Modifier mon contrat',
        description: 'Changer de formule, modifier vos coordonnées ou ajuster votre puissance',
      },
      information: {
        title: 'Demande d\'information',
        description: 'Poser une question sur nos services, tarifs ou conditions',
      },
      newConnection: {
        title: 'Nouveau raccordement',
        description: 'Demander le raccordement au réseau pour un nouveau bâtiment',
      },
    },

    // Contract entity types
    contractType: 'Type de contrat',
    individual: 'Particulier',
    individualDesc: 'Pour un logement individuel',
    household: 'Foyer familial',
    householdDesc: 'Pour une résidence familiale',
    company: 'Entreprise',
    companyDesc: 'Pour un usage professionnel',

    // Personal information fields
    personalInfo: 'Informations personnelles',
    cin: 'Numéro CIN',
    cinPlaceholder: 'Votre numéro d\'identification nationale',
    firstName: 'Prénom',
    firstNamePlaceholder: 'Votre prénom',
    lastName: 'Nom',
    lastNamePlaceholder: 'Votre nom de famille',
    email: 'Adresse e-mail',
    emailPlaceholder: 'votre.email@exemple.fr',
    phone: 'Téléphone',
    phonePlaceholder: '+33 6 00 00 00 00',

    // Address fields
    addressInfo: 'Adresse du lieu',
    address: 'Adresse complète',
    addressPlaceholder: 'Numéro, rue, bâtiment...',
    city: 'Ville',
    cityPlaceholder: 'Ville',
    postalCode: 'Code postal',
    postalCodePlaceholder: '75001',

    // Household-specific fields
    householdInfo: 'Informations du foyer',
    occupants: 'Nombre d\'occupants',
    occupantsPlaceholder: 'Nombre de personnes',
    ownershipStatus: 'Statut d\'occupation',
    owner: 'Propriétaire',
    tenant: 'Locataire',

    // Company-specific fields
    companyInfo: 'Informations de l\'entreprise',
    companyName: 'Raison sociale',
    companyNamePlaceholder: 'Nom de l\'entreprise',
    companyAddress: 'Adresse du siège',
    companyAddressPlaceholder: 'Adresse du siège social',
    legalRepresentative: 'Représentant légal',
    legalRepresentativePlaceholder: 'Nom du représentant',
    registrationNumber: 'Numéro SIRET',
    registrationNumberPlaceholder: 'Numéro d\'identification',
    businessContact: 'Contact professionnel',
    businessContactPlaceholder: 'Téléphone professionnel',

    // Contract details fields
    contractDetails: 'Détails du contrat',
    startDate: 'Date de début souhaitée',
    startDatePlaceholder: 'Sélectionnez une date',

    // Information request fields
    subject: 'Sujet de la demande',
    subjectPlaceholder: 'Décrivez brièvement votre demande',
    message: 'Votre message',
    messagePlaceholder: 'Détaillez votre question ou demande...',

    // Connection request fields
    connectionInfo: 'Informations de raccordement',
    propertyType: 'Type de bien',
    newConstruction: 'Construction neuve',
    existingBuilding: 'Bâtiment existant',
    plotReference: 'Référence cadastrale',
    plotReferencePlaceholder: 'Numéro de parcelle',
    estimatedPower: 'Puissance estimée (kVA)',
    estimatedPowerPlaceholder: 'ex: 12',

    // Contract modification fields
    contractNumber: 'Numéro de contrat',
    contractNumberPlaceholder: 'Votre numéro de contrat actuel',
    modificationReason: 'Motif de la modification',
    changeFormula: 'Changement de formule',
    changePower: 'Modification de puissance',
    changeAddress: 'Changement d\'adresse',
    changeContact: 'Mise à jour des coordonnées',
    modificationDetails: 'Détails de la modification',
    modificationDetailsPlaceholder: 'Précisez les changements souhaités...',

    // Action buttons
    continue: 'Continuer',
    submit: 'Soumettre la demande',
    back: 'Retour',
    reset: 'Recommencer',

    // Validation messages
    required: 'Ce champ est requis',
    invalidEmail: 'Adresse e-mail invalide',
    invalidPhone: 'Numéro de téléphone invalide',

    // Confirmation screen
    confirmationTitle: 'Demande enregistrée',
    confirmationMessage: 'Votre demande a été transmise avec succès. Vous recevrez une confirmation par e-mail.',
    referenceNumber: 'Numéro de référence',
    newRequest: 'Nouvelle demande',

    // Footer content
    helpLine: 'Service client disponible du lundi au vendredi, 8h-18h',
    dataProtection: 'Vos données sont protégées conformément au RGPD',
  },

  // English translations
  en: {
    // Header section
    siteName: 'Electricity Services',
    tagline: 'Intelligent services portal',

    // Language selector
    language: 'Language',
    french: 'Français',
    english: 'English',

    // Main page headings
    mainHeading: 'How can we help you?',
    mainSubheading: 'Select the type of request that matches your situation. We will adapt the form to your needs.',

    // Request type cards
    requestTypes: {
      newContract: {
        title: 'New contract',
        description: 'Subscribe to an electricity contract for your home or business premises',
      },
      modifyContract: {
        title: 'Modify my contract',
        description: 'Change your plan, update your details or adjust your power capacity',
      },
      information: {
        title: 'Information request',
        description: 'Ask a question about our services, rates or conditions',
      },
      newConnection: {
        title: 'New connection',
        description: 'Request a connection to the grid for a new building',
      },
    },

    // Contract entity types
    contractType: 'Contract type',
    individual: 'Individual',
    individualDesc: 'For individual housing',
    household: 'Family household',
    householdDesc: 'For family residence',
    company: 'Company',
    companyDesc: 'For business use',

    // Personal information fields
    personalInfo: 'Personal information',
    cin: 'ID Number',
    cinPlaceholder: 'Your national ID number',
    firstName: 'First name',
    firstNamePlaceholder: 'Your first name',
    lastName: 'Last name',
    lastNamePlaceholder: 'Your family name',
    email: 'Email address',
    emailPlaceholder: 'your.email@example.com',
    phone: 'Phone',
    phonePlaceholder: '+33 6 00 00 00 00',

    // Address fields
    addressInfo: 'Location address',
    address: 'Full address',
    addressPlaceholder: 'Number, street, building...',
    city: 'City',
    cityPlaceholder: 'City',
    postalCode: 'Postal code',
    postalCodePlaceholder: '75001',

    // Household-specific fields
    householdInfo: 'Household information',
    occupants: 'Number of occupants',
    occupantsPlaceholder: 'Number of people',
    ownershipStatus: 'Occupancy status',
    owner: 'Owner',
    tenant: 'Tenant',

    // Company-specific fields
    companyInfo: 'Company information',
    companyName: 'Company name',
    companyNamePlaceholder: 'Name of the company',
    companyAddress: 'Headquarters address',
    companyAddressPlaceholder: 'Registered office address',
    legalRepresentative: 'Legal representative',
    legalRepresentativePlaceholder: 'Representative name',
    registrationNumber: 'Registration number',
    registrationNumberPlaceholder: 'Business ID number',
    businessContact: 'Business contact',
    businessContactPlaceholder: 'Business phone',

    // Contract details fields
    contractDetails: 'Contract details',
    startDate: 'Desired start date',
    startDatePlaceholder: 'Select a date',

    // Information request fields
    subject: 'Request subject',
    subjectPlaceholder: 'Briefly describe your request',
    message: 'Your message',
    messagePlaceholder: 'Detail your question or request...',

    // Connection request fields
    connectionInfo: 'Connection information',
    propertyType: 'Property type',
    newConstruction: 'New construction',
    existingBuilding: 'Existing building',
    plotReference: 'Plot reference',
    plotReferencePlaceholder: 'Plot number',
    estimatedPower: 'Estimated power (kVA)',
    estimatedPowerPlaceholder: 'e.g.: 12',

    // Contract modification fields
    contractNumber: 'Contract number',
    contractNumberPlaceholder: 'Your current contract number',
    modificationReason: 'Reason for modification',
    changeFormula: 'Change plan',
    changePower: 'Modify power',
    changeAddress: 'Change address',
    changeContact: 'Update contact details',
    modificationDetails: 'Modification details',
    modificationDetailsPlaceholder: 'Specify the desired changes...',

    // Action buttons
    continue: 'Continue',
    submit: 'Submit request',
    back: 'Back',
    reset: 'Start over',

    // Validation messages
    required: 'This field is required',
    invalidEmail: 'Invalid email address',
    invalidPhone: 'Invalid phone number',

    // Confirmation screen
    confirmationTitle: 'Request submitted',
    confirmationMessage: 'Your request has been successfully transmitted. You will receive a confirmation by email.',
    referenceNumber: 'Reference number',
    newRequest: 'New request',

    // Footer content
    helpLine: 'Customer service available Monday to Friday, 8am-6pm',
    dataProtection: 'Your data is protected in accordance with GDPR',
  },
} as const;

/** Type for accessing translation keys */
export type TranslationKey = keyof typeof translations.fr;
