export const cleanUpPhone = phone => phone.replace(/^\+/, '').replace(/\s/gm, '')
    .replace(/\(/gm, '').replace(/\)/gm, '').replace(/\-/gm, '');