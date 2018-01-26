const int16 = (msb, lsb) => {
  const result = (msb << 8) | lsb;
  return result >> 15 ? ((result ^ 0xFFFF) + 1) * -1 : result;
};

export default {int16};
