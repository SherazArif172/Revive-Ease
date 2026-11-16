
export function getUserAvatarUrl({ baseUrl, profileImgPath, userType }) {
  if (profileImgPath) {
    return `${baseUrl}${profileImgPath}`;
  }
  switch ((userType || '').toLowerCase()) {
    case 'provider':
      return require('../assets/avatars/default_img.png');
    case 'coach':
      return require('../assets/avatars/default_img.png');
    case 'clinic admin':
    case 'admin':
      return require('../assets/avatars/default_img.png');
    default:
      return require('../assets/avatars/default_img.png');
  }
}


