function checkEnv() {
  const nep = window.nep;
  if (!nep) {
    alert('cf-neptune not found, please build the project and try again');
  }
}
