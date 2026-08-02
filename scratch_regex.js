const cocineros = "Silvia, Dani i Ivan";
const parts1 = cocineros.split(/[,i]+/).map(c => c.trim()).filter(Boolean);
console.log(parts1);

const parts2 = cocineros.split(/, | i /).map(c => c.trim()).filter(Boolean);
console.log(parts2);
