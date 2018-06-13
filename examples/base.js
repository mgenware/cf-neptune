function checkEnv() {
  const cfn = window.cfn;
  if (!cfn) {
    alert('cf-neptune not found, please build the project and try again');
  }
}
