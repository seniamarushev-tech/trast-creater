let user = {
  role: null,
  trust: 1,
  art: 0
};

function selectRole(role) {
  user.role = role;

  document.getElementById('screen-role').classList.remove('active');
  document.getElementById('screen-dashboard').classList.add('active');

  document.getElementById('role-title').innerText =
    role === 'fan' ? '🎧 Фанат' : '🎤 Артист';

  render();
}

function render() {
  document.getElementById('trust-value').innerText = user.trust;
  document.getElementById('art-value').innerText = user.art;
}

function buyTrust() {
  // ИЛЛЮЗИЯ ПОКУПКИ
  user.trust += 1;
  alert('Trust активирован (симуляция)');
  render();
}

function buyArt() {
  user.art += 10;

  // Каждые 100 ART → +1 Trust
  if (user.art >= 100) {
    user.art -= 100;
    user.trust += 1;
    alert('ART превратился в Trust');
  }

  render();
}
