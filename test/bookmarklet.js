javascript: (function() {

  var LOGIN_URL  = 'http://www.mrmlsmatrix.com/matrix/login.aspx';
  var LOGIN_PAGE = 'http://idp.crmls.org/idp/Authn/UserPassword';
  var LOCATION   = window.location+'';
  var STORAGE_USERNAME_KEY = 'CRMLS_USERNAME';
  var STORAGE_PASSWORD_KEY = 'CRMLS_PASSWORD';

  if (LOCATION === LOGIN_URL || LOCATION === LOGIN_PAGE) {

    function username() {
      var username = localStorage.getItem(STORAGE_USERNAME_KEY);
      if (!username) {
        username = prompt('Please enter your CRMLS username...');
        localStorage.setItem(STORAGE_USERNAME_KEY, username);
      }
      return username;
    }

    function password() {
      var password = localStorage.getItem(STORAGE_PASSWORD_KEY);
      if (!password) {
        password = prompt('Please enter your CRMLS password...');
        localStorage.setItem(STORAGE_PASSWORD_KEY, password);
      }
      return password;
    }

    $('input#j_username').val( username() );
    $('input#password').val( password() );
    $('input#j_password').val( password() );

    $('form').submit();
  }

  else {
    window.location = LOGIN_URL;
  }
})();
