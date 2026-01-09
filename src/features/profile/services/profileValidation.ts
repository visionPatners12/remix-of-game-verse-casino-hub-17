export const profileValidation = {
  validateUsername(username: string): string {
    if (username.length < 3) {
      return 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }
    if (username.length > 20) {
      return 'Le nom d\'utilisateur ne peut pas dépasser 20 caractères';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores';
    }
    if (username.startsWith('_') || username.endsWith('_')) {
      return 'Le nom d\'utilisateur ne peut pas commencer ou finir par un underscore';
    }
    return '';
  },

  validateEmail(email: string): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Adresse email invalide';
    }
    return '';
  },

  validatePhone(phone: string): string {
    const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
    if (phone && !phoneRegex.test(phone)) {
      return 'Numéro de téléphone invalide';
    }
    return '';
  },

  validateBio(bio: string): string {
    if (bio.length > 160) {
      return 'La bio ne peut pas dépasser 160 caractères';
    }
    return '';
  },

  cleanUsername(username: string): string {
    return username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  }
};