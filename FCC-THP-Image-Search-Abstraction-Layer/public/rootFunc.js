const query = document.getElementById("query");
const outputURL = document.getElementById("output-url");
const page = document.getElementById("page");
const inputArea = document.getElementById("input-area");
const imageSize = document.getElementById("image-size");
const searchType = document.getElementById("search-type");

let baseURL = "https://a9f3bdcf-e3d2-4d15-a45a-ca8be79e65fc-00-38tu59bcchmg9.worf.replit.dev/";

searchType.addEventListener("click", () => {
  if (searchType.value === "recent") {
    outputURL.innerHTML = ` <a href="${baseURL}recent/">${baseURL}recent/</a>`;
    query.setAttribute("disabled", true);
    page.setAttribute("disabled", true);
    imageSize.setAttribute("disabled", true);
    query.value = ""
  } else {
    outputURL.innerHTML = "";
    query.removeAttribute("disabled");
    page.removeAttribute("disabled");
    imageSize.removeAttribute("disabled");
  }
});

const generateURL = () => {
  let outputString = `
      <a href="${baseURL}query/${query.value}?page=${page.value}">${baseURL}query/${query.value}?page=${page.value}</a>
      `;
  if (imageSize.value !== "all"){
    outputString = outputString.replace(/(size=\d+<\/a>|<\/a>)/, `&size=${imageSize.value}</a>`)
  } 
  outputURL.innerHTML = outputString
  return
}

inputArea.addEventListener("keyup", (event) => {
  console.log(query.nodeValue, event.target.value, 'here')
  if (query.value) {
    generateURL()
  }  else {
      outputURL.innerHTML = baseURL;
    }
});

imageSize.addEventListener('click', (event) => {
  if (outputURL && outputURL.textContent != "https://a9f3bdcf-e3d2-4d15-a45a-ca8be79e65fc-00-38tu59bcchmg9.worf.replit.dev/"){
    generateURL()
  }
})