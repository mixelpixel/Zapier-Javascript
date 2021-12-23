/*
This script was written to generate random passwords for Zoom meetings per the
particular administrative Zoom privacy settings of a professional Zoom user.
This script is being implemeneted because with the current Zoom setup for
them, the Zapier "Create Meeting in Zoom" action does not automatically add a
dynamic password to the meeting, i.e. when the password field is left blank, no
password is included.  The password field does not allow for input data to be
passed in from previous steps.  Therefore, any value entered will be used with
every meeting created by the Zap.

The intended implementation is with a Zapier code block which will create Zoom
meetings and add the Zoom "Join URL" to the Google Calendar event.  To achieve
this dynamic password protection, the results of this code block will be passed
to a Webhook which updates the meeting.

Per the businesses Zoom account settings, passwords require at
minimum
* 8 characters including
* at least one number
* at least one lowercase, and
* one uppercase letter

NOTE: While it is very likely that a password generated from a set of
26 lowercase letters [a-z], 26 uppercase letters [A-Z], and only ten integers
[0-9] could result in a password which did not contain any numbers, the
statistical likelihood of there being only lowercase or only uppercase letters
is extremely low.  For peace of mind, however, to ensure the Zoom password
requirements for the operations account are met, the checks for the numeric
condition have also been included in this script's order of operations.  In the
case that special characters which Zoom allows were also required for the Zoom
user's password, then following the pattern of the code below would adequately
ensure that any password this script produces would mmatch that condition.

Basic Zoom password requirements:
https://support.zoom.us/hc/en-us/articles/115005166483-Managing-your-password#h_6d872dd8-6215-43b2-9ddf-8d5c966725d0

Of note, the link above indicates that either an exclamation point or an
octothorpe (! #) are acceptable special characters, but per more detailed docs,
only the folloowing four are allowed.  I have not tested this.

Zoom special characters: @ * _ – per:
https://uis.jhu.edu/zoom/securing-your-zoom-meetings/

Per the api doc, Zoom allows for the following four special characters: `@-_*`
and a maximum of 10 characters:
https://marketplace.zoom.us/docs/api-reference/zoom-api/meetings/meetingupdate#request-body

I am unsure if Zoom supports the complete set of ASCII special characters:
https://www.webopedia.com/definitions/special-character/

NOTE: it is also likely that simply doubling the numerical values in the
`characters` string would increase the likelyhood that there would always be a
mix of numbers, lower-, and uppercase letters, however, the conditional checks
are reliably preventative for QC of resulting, acceptable passwords.

UPDATE 11/10/2021 - TBD: create a function for the pattern of the conditionals,
i.e. function(array of test conditions, char set, &?)
foreach test condition, sepect random char from char set,
select random index value from index array then remove that value from the index
array, then splice the password.
*/

/* The followinbg line is for use in Node; comment out for use in Zapier's Code
block as the `output` variable is presumed. */
// let output = [];

const makeZoomPassword = (length) => {
  let password          = '';
  let indexArray        = [];
  const digits          = '0123456789';
  const lowerCase       = 'abcdefghijklmnopqrstuvwxyz';
  const upperCase       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const characters      = upperCase.concat(lowerCase, digits);
  /* Helper functions */
  // Generates a random value based a string or array's length. The Math.floor()
  // function sets the resulting value range to match the range of index numbers
  const randomIndex = x => {return Math.floor(Math.random() * x.length)};
  // Mutates an array by removing values
  const removeFromArray = (arr, index) => {
    let s = new Set(arr);
    s.delete(arr[index])
    return arr = Array.from(s)
  }
  // Add each index number for the intended length of the password
  for (let l = 0; l < length; l++) {
    indexArray.push(l);
  }
  // Generate an iniitial password
  for (let i = 0; i < length; i++) {
    password += characters.charAt(randomIndex(characters));
  }
  // Test the initial password for "must contain a digit"
  if (/\d/.test(password) == false) {
    const randomDigit = digits[randomIndex(digits)];
    const numReplacementIndex = randomIndex(indexArray);
    password = password.slice(0, indexArray[numReplacementIndex])
             + randomDigit
             + password.slice(indexArray[numReplacementIndex] + 1);
    indexArray = removeFromArray(indexArray, numReplacementIndex);
  }
  // Test the initial password for "must contain a lowercase letter"
  if (/[a-z]/.test(password) == false) {
    const randomLowerCase       = lowerCase[randomIndex(lowerCase)];
    const lowerCaseReplaceIndex = randomIndex(indexArray);
    password = password.slice(0, indexArray[lowerCaseReplaceIndex])
             + randomLowerCase
             + password.slice(indexArray[lowerCaseReplaceIndex] + 1);
    indexArray = removeFromArray(indexArray, lowerCaseReplaceIndex);
  }
  // Test the initial password for "must contain an uppercase letter"
  if (/[A-Z]/.test(password) == false) {
    const randomUpperCase       = upperCase[randomIndex(upperCase)];
    const upperCaseReplaceIndex = randomIndex(indexArray);
    password = password.slice(0, indexArray[upperCaseReplaceIndex])
             + randomUpperCase
             + password.slice(indexArray[upperCaseReplaceIndex] + 1);
    indexArray = removeFromArray(indexArray, upperCaseReplaceIndex);
  }
  // Password meets basic security preferences
  return password;
}

const zoomPassword = makeZoomPassword(10);

output = [{
  'password': zoomPassword,
  'validPassword': /\d/.test(zoomPassword)
    && /[a-z]/.test(zoomPassword)
    && /[A-Z]/.test(zoomPassword)
    && zoomPassword.length >= 8
    && zoomPassword.length <= 10
}];

// console.log(output);

/* ****************** If false, the qc logic isn't working ****************** */
// console.log(/\d/.test(output[0].password)
//       && /[a-z]/.test(output[0].password)
//       && /[A-Z]/.test(output[0].password));
