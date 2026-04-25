const generateCaseId = () => {
  const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford Base32
  const rand = () => chars[Math.floor(Math.random() * chars.length)];
  const seg = (n) => Array.from({ length: n }, rand).join('');
  return `CA-${seg(4)}-${seg(4)}`;
};

module.exports = generateCaseId;
