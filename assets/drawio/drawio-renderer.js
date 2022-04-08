window.addEventListener("load", function () {
  let permittedTagNames = ["DIV", "SPAN", "SECTION", "BODY"];

  // addStyle("https://laingsimon.github.io/render-diagram/drawio-renderer.css");
  // addScript("https://www.draw.io/js/viewer.min.js");

  waitForDrawIo(function (timeout) {
    let diagrams = document.querySelectorAll(".drawio-diagram");

    diagrams.forEach(function (diagram) {
      if (permittedTagNames.indexOf(diagram.tagName) === -1) {
        return; //not included in a permitted tag
      }

      if (timeout) {
        showError(diagram, "Unable to load draw.io renderer");
        return;
      }

      processDiagram(diagram);
    });
  })
})

function waitForDrawIo(callback, attempt) {
  if (!attempt) {
    attempt = 0;
  }

  if (typeof GraphViewer === "undefined") {
    if (attempt >= 5) {
      callback(true);
      return;
    }

    window.setTimeout(function () {
      waitForDrawIo(callback, attempt + 1);
    }, 500);

    return;
  }

  callback(false);
}

function addStyle(url){
	let link = document.createElement("link");
	link.setAttribute("rel", "stylesheet");
	link.setAttribute("type", "text/css");
	link.setAttribute("href", url);

	document.head.appendChild(link);
}

function addScript(url){
	let script = document.createElement("script");
	script.setAttribute("src", url);

	document.body.appendChild(script);
}

function processDiagram(diagram) {
  try {
    let url = diagram.getAttribute("data-diagram-url");
    let data = diagram.getAttribute("data-diagram-data");
    data = `1VtNk5s4EP01vqYQAhsfY2eS3UMqqfJu7eaowQooAeQI4Y/99SsGgXELJw7GoPHBhRrRkl4/ulste4bX6fGDILv4I9/SZOY62+MMv5u5brBcqO9ScKoEfhBUgkiwbSVCZ8GG/Ue10NHSgm1pftFRcp5ItrsUhjzLaCgvZEQIfrjs9pUnl6PuSKRHdM6CTUgSanT7h21lrJflt3r/QVkU1yMjR995JuH3SPAi0+PNXPz15VPdTkmtS/fPY7Llh5YIP83wWnAuq6v0uKZJCW0NW/Xc+yt3m3kLmslbHnCrB/YkKfTS3zESCZLq6clTDckhZpJudiQs2wdl9Rle5VLw7w1CWElimSbqEqlLcyp6dnsqJD22RHpqHyhPqRQn1UXf9eYaJk0jTzcPZ5ugGsm4ZY/6MaJpEDWaz1CoC41GNzLYQGYjRRHKQtCZO1d2VVzFK5vQat4ejRYaEy7PgGtFY7JnvBCWwhVMCZdvwLVOSJ4rkU0QLS8Rcv0REZqbCPF0x3OFQotQtr+TgGM4GBHBhYHgZxWdyshnJ1YYTwhWYAZCukv4KS3XYydeaDEhXsvu1zOzF67Ge03hzWo/0MLr0/O3MnW1EywPTQkWMsB6G0q2Z/JkKVx+MCVcZhL/ZyapIAoznlmK2AJPiZiZ3P+dq7DorElua3QMJqWYmd5vJCkzMecjCWOW2YoaciblmZnmb+iPgmahrXhBRzZqToE6c/60yFhIXpErGxczM8vvdv6f1IL2jB4sBRG6t3FBNLP/v1jKsshSsAyvNi5aZu5voEK3Ed3oJk2e+eHpLFi9CNSNcsHq1VbjrF5KprQcwLkRrZwXItSj6XAuiYio7qWnVM7jp4i2AXM6AGuEgibKCe0vC8RdMOoxPnNWboWulFKavVutoVqOfuhsC0MPAoqgngoDQ8+LTZtl32Tmmj72mNmz38w+LJm5Pe08h4SBigY0tLndmtjQvmlobJmhYVqJ+77PQBGCiq7Y+a0Q5NTqtis75Nfni2D14/JgSF1UGnuTyNyE3k0iemTy35JCb3zd+qIJpcgjTq1bZfOLZth91Fu+Ouo15xb3Ug/qGYh5xinC0MwzN/MTu6+6dmYzifyh8hG/Vz7yuyTCiweTyCxwTEyiuf0cgo5oOZAjgnqGCoGPdkRmtedVhsDAfuYBS/q9mQcUeQ+innH2NDT1zMrZ/dT7CcGu0/I+6i3spx50erCi0tfpQT1DBU7vwcwz648TB8769LBNIs8yEvngh21u0JNFc6AIQUUD0WgBJzw0jcwK7NQ06qg22UYjD54J9o2D8NjHSOUGotESTnhoGj2gND1FHKyP9G0mn3/tZPW3fRgMqVDRQOQL4IQHJl+t/tWTr+M4xTryOQN5vrkzkueDP6gamnzWFfFRRxW/9mvW8MiDO8m+Tgwe/Hg3OrE+pnatM3VHsco6U89B7uH33bktgCLvxq1bH1PbV9vu2KLbZ2o0lKnReKa2rgKNOgqB1pka+l2/904aOvAbd9K/NrVqnv/QV3U//2kSP/0P`;

    if (data) {
      addDiagram(data, diagram, getUserOptions(diagram));
      return;
    }

    if (url) {
      diagram.innerHTML = "";
      diagram.className += " drawio-diagram-loading";

      loadDataFromUrlThen(url, function (data, error) {
        try {
          if (error) {
            showError(diagram, "Url: <a href=\"" + url + "\" target=\"_blank\">" + url + "</a><br />Status: " + error.status);
            return;
          }

          let dataMatch = data != null ? data.match(/\<diagram .+?\>(.+)\<\/diagram\>/) : null;
          if (dataMatch != null && dataMatch.length >= 2) {
            data = dataMatch[1];
          }

          addDiagram(data, diagram, getUserOptions(diagram));
        } catch (e) {
          showError(diagram, e);
        }
      });
      return;
    }

    showError(diagram, "No means to process diagram, no drawio-diagram-data or drawio-diagram-url attribute");
  } catch (e) {
    showError(diagram, e);
  }
}

function showError(diagram, errorHtml) {
  diagram.className = diagram.className.replace(" drawio-diagram-loading", "") + " drawio-diagram-error";
  diagram.innerHTML = "Error loading diagram<br />" + errorHtml;
}

function loadDataFromUrlThen(url, callback) {
  let xmlhttp = null;

  if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  }
  else {// code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4) {
      if (xmlhttp.status == 200) {
        callback(xmlhttp.responseText, null);
      } else {
        callback(null, { status: xmlhttp.status, text: xmlhttp.responseText });
      }
      return;
    }
  }
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

function addDiagram(diagramData, replaceElement, userOptions) {
  let div = document.createElement("div");
  div.setAttribute("class", "mxgraph");
  div.setAttribute("data-mxgraph", JSON.stringify(getMxGraphData(diagramData, userOptions)));
  replaceElement.parentElement.insertBefore(div, replaceElement);
  replaceElement.parentElement.removeChild(replaceElement);

  GraphViewer.createViewerForElement(div, (viewer) => {
    console.log(viewer);
  });

  return;

  window.setTimeout(function () {
    let svgElements = div.getElementsByTagName("svg");
    if (svgElements.length === 0) {
      let errorDiv = document.createElement("div");
      div.parentElement.insertBefore(errorDiv, div);
      div.parentElement.removeChild(div);

      showError(errorDiv, div.innerText);
    }
  }, 500);

  GraphViewer.processElements();
}

function getMxGraphData(diagramData, userOptions) {
  let options = Object.assign({}, getDefaultOptions());
  if (userOptions) {
    options = Object.assign(options, userOptions);
  }

  if (!diagramData.includes('mxfile'))
    diagramData = `<mxfile version=\"10.6.5\"><diagram>${diagramData}</diagram></mxfile>`;
  else
    diagramData = decodeURIComponent(diagramData);

  return Object.assign(options, {
    xml: diagramData
  });
}

function getUserOptions(diagram) {
  let options = diagram.getAttribute("data-diagram-options");
  if (!options) {
    return null;
  }

  return JSON.parse(options);
}

function getDefaultOptions() {
  return {
    highlight: "none",
    target: "self",
    lightbox: false,
    nav: true
  };
}
