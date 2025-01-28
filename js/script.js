// Selecionando o botão de toggle e o menu
const menuToggle = document.getElementById('menu-toggle');
const menuList = document.getElementById('menu-list');

// Função para alternar o menu
menuToggle.addEventListener('click', () => {
  menuList.classList.toggle('open');
  console.log("Clicado")
});


document.addEventListener('DOMContentLoaded', function() {
  // Lista de ações (ações que serão usadas no conteúdo)
  let listShares = ['BBAS3', 'ITSA4', 'CXSE3', 'TAEE3/TAEE4', 'ISAE4', 'CPLE6', 'CPLE3', 'SAPR4', 'KLBN4'];

  // Dados específicos de cada ação para o gráfico
  const shareData = {
    'BBAS3': [0.74, 1.13, 2.07, 2.27, 2.60],
    'ITSA4': [0.65, 0.39, 0.61, 0.58, 0.67],
    'CXSE3': [0, 0.24, 0.65, 1, 1.06],
    'TAEE3/TAEE4': [1.07, 1.5, 1.62, 0.97, 1.18],
    'ISAE4': [1.74, 3.59, 1.06, 2.2, 0],
    'CPLE6': [0.31, 1.31, 0.89, 0.33, 0.42],
    'CPLE3': [0.28, 1.19, 0.81, 0.3, 0.39],
    'SAPR4': [0.2, 0.22, 0.31, 0.31, 0.32],
    'KLBN4': [0, 0.07, 0.3, 0.27, 0.27]
  };

  const content = [];
  
  // Criar os conteúdos com a lista de ações
  for (let i = 0; i < listShares.length; i++) {
    content.push('<div class="carousel-item-content" id="item-content-' + listShares[i].replace('/', '-') + '">' + 
      '<div class="title-carousel">'+
        '<h1 >' + listShares[i] + '</h1>' +
        '<div class="number-shares">'+
          '<div>' +
            '<h4>R$100,00</h4>' +
            '<p>Quantidade: </p>' +
            '<p>' + Math.ceil(100/somarProventos(listShares[i])) + '</p>' +
          '</div>' +
          '<div>' +
            '<h4>R$1000,00</h4>' +
            '<p>Quantidade: </p>' +
            '<p>' + Math.ceil(1000/somarProventos(listShares[i])) + '</p>' +
          '</div>'+
        '</div>'+
      '</div>'+      
      '<div class="grid-container">' +
        '<div class="grid-item grid-graphic"><canvas></canvas></div>' +
        '<div class="grid-item grid-current-price">' +
          '<p>Cotação atual:</p>' +
          '<i class="fa-solid fa-coins"></i>'+
          '<input type="text" class="current-price" id="current-price-' + listShares[i].replace('/', '-') + '" data-share="' + listShares[i].replace('/', '-') + '"  oninput="atualizarFace(this)" placeholder="R$"></input>' +
        '</div>' +
        '<div class="grid-item grid-percentage-dividends">' +
          '<p>Taxa de juros:</p>' +
          '<i class="fa-solid fa-percent"></i>'+
          '<input type="text" class="current-price" id="percentage-dividends-' + listShares[i].replace('/', '-') + '" data-share="' + listShares[i].replace('/', '-') + '"  oninput="updateMaximumPrice(this)" placeholder="%" value="6"></input>' +
        '</div>' +
        '<div class="grid-item grid-maximum-price">' +
          '<p>Preço Teto:</p>' +
          '<i class="fas fa-chart-line"></i>'+
          '<p>R$ <span id="maximum-price-' + listShares[i].replace('/', '-') + '">' + (somarProventos(listShares[i])/0.06).toFixed(2).replace('.',',') + '</span></p>' +
        '</div>' +
        '<div class="grid-item grid-average-earnings">' +
          '<p>Média Proventos <p>(5 anos)</p>' +
          '<p>R$<span id="average-earnings-' + listShares[i].replace('/', '-') + '">' + somarProventos(listShares[i]).replace('.',',') + '</span></p>' +
            '<i class="fa-regular fa-face-laugh-squint"  style="display:none;"></i>' +
            '<i class="fa-regular fa-face-sad-cry" style="display:none;"></i>' +
            '<i class="fa-regular fa-face-meh-blank"></i>' +
          '</p>'+
        '</div>' +
      '</div>' +
    '</div>');
  }  

  // Criar o container do carrossel
  const carouselContainer = document.createElement('div');
  carouselContainer.classList.add('carousel');

  // Criar a área de itens do carrossel
  const carouselItemsContainer = document.createElement('div');
  carouselItemsContainer.classList.add('shares-carousel');

  // Adicionar os blocos de conteúdo (divs com conteúdo)
  content.forEach((itemContent, index) => {
    const item = document.createElement('div');
    item.classList.add('carousel-item');
    item.innerHTML = itemContent; // Adiciona o conteúdo HTML dentro do item
    carouselItemsContainer.appendChild(item);

    // Criar o gráfico para o item correspondente
    const canvasElement = item.querySelector('canvas');
    if (canvasElement) {
      const shareName = listShares[index]; // Pega o nome da ação (ex: 'BBAS3')
      const dataForChart = shareData[shareName]; // Obtém os dados para essa ação
      criarGrafico(canvasElement, dataForChart); // Cria o gráfico com os dados específicos
    }
  });

  // Botão de navegação - Anterior
  const prevButton = document.createElement('button');
  prevButton.classList.add('carousel-button', 'prev');
  prevButton.textContent = '<';
  prevButton.onclick = () => moveCarousel(-1);

  // Botão de navegação - Próximo
  const nextButton = document.createElement('button');
  nextButton.classList.add('carousel-button', 'next');
  nextButton.textContent = '>';
  nextButton.onclick = () => moveCarousel(1);

  // Adicionar todos os elementos ao carrossel
  carouselContainer.appendChild(carouselItemsContainer);
  carouselContainer.appendChild(prevButton);
  carouselContainer.appendChild(nextButton);

  // Inserir o carrossel no container da página
  const carouselParent = document.getElementById('shares-carousel');
  if (carouselParent) {
    carouselParent.appendChild(carouselContainer);
  } else {
    console.error("Elemento #shares-carousel não encontrado.");
  }

  let currentIndex = 0;

  // Função para somar os valores de uma ação específica (ex: 'BBAS3')
  function somarProventos(acao) {
    const dados = shareData[acao];
    const soma = dados.reduce((acc, val) => acc + val, 0);
    return (soma/5).toFixed(2);
  }

  // Função para mover o carrossel
  function moveCarousel(direction) {
    const totalItems = content.length;
    currentIndex = (currentIndex + direction + totalItems) % totalItems;
    const offset = -currentIndex * 100; // Calcula o deslocamento em porcentagem
    carouselItemsContainer.style.transform = `translateX(${offset}%)`;
  }

  // Função para criar o gráfico
  function criarGrafico(canvasElement, dataForChart) {
    var ctx = canvasElement.getContext('2d');
    var meuGrafico = new Chart(ctx, {
      type: 'bar', // Tipo de gráfico (pode ser 'bar', 'line', 'pie', etc.)
      data: {
        labels: ['2020', '2021', '2022', '2023', '2024'], // Rótulos do eixo X
        datasets: [{
          label: 'Proventos - R$', // Nome da série de dados
          data: dataForChart, // Passa os dados específicos para o gráfico
          backgroundColor: 'rgba(54, 162, 235, 0.2)', // Cor de fundo das barras
          borderColor: 'rgba(54, 162, 235, 1)', // Cor da borda das barras
          borderWidth: 1
        }]
      },
      options: {
        responsive: true, // Torna o gráfico responsivo para dispositivos móveis
        scales: {
          y: {
            beginAtZero: true // Faz o eixo Y começar do zero
          }
        }
      }
    });
    canvasElement.chart = meuGrafico; // Armazenar o gráfico no canvas para evitar recriação
  }
  // Inicializar o carrossel e criar o gráfico no primeiro item
  moveCarousel(0);
});




function atualizarFace(inputElement) {
  inputElement.addEventListener("input", function() {
    // Expressão regular para permitir apenas números e vírgulas
    const regex = /^[0-9,]*$/;
    // Se o valor no input não corresponder ao padrão, apague o valor
    if (!regex.test(inputElement.value)) {
        // Apaga o último caractere
        inputElement.value = inputElement.value.slice(0, -1); 
    }
  });
  // Pega o valor digitado no campo de input
  const valor = parseFloat((inputElement.value).replace(',','.'));
  
  // Obtém o nome da ação a partir do atributo data-share
  const share = inputElement.getAttribute('data-share');
  
  const maximumPrice = parseFloat((document.getElementById('maximum-price-' + share).textContent).replace(',','.'));

  const faceLaugh = document.querySelector('#item-content-' + share + ' .fa-face-laugh-squint');
  const faceSad = document.querySelector('#item-content-' + share + ' .fa-face-sad-cry');
  const faceMeh = document.querySelector('#item-content-' + share + ' .fa-face-meh-blank');
  
  // Esconde todos os ícones inicialmente
  faceLaugh.style.display = 'none';
  faceSad.style.display = 'none';
  faceMeh.style.display = 'none';

  // Calcula a lógica para mostrar o ícone correto com base no preço atual e a média de proventos
  if (valor < maximumPrice) {
    faceLaugh.style.display = 'inline-block'; // Mostra o ícone de felicidade
  } else if (valor > maximumPrice) {
    faceSad.style.display = 'inline-block'; // Mostra o ícone de tristeza
  } else {
    faceMeh.style.display = 'inline-block'; // Mostra o ícone neutro
  }
}

function updateMaximumPrice(inputElement) {
  inputElement.addEventListener("input", function() {
    // Expressão regular para permitir apenas números e vírgulas
    const regex = /^[0-9,]*$/;
    // Se o valor no input não corresponder ao padrão, apague o valor
    if (!regex.test(inputElement.value)) {
        // Apaga o último caractere
        inputElement.value = inputElement.value.slice(0, -1); 
    }
  });
  // Pega o valor digitado no campo de input
  const valor = parseFloat((inputElement.value).replace(',','.'));
  // Obtém o nome da ação a partir do atributo data-share
  const share = inputElement.getAttribute('data-share');

  // Pega o valor do span (média de proventos) da ação
  const mediaProventos = parseFloat((document.querySelector('#average-earnings-' + share).textContent).replace(',','.'));
  // Exibe o valor do span no console
  let maximumPrice = mediaProventos / (valor/100);

  // Pega os ícones de face
  const idMaximumPrice = document.getElementById('maximum-price-' + share);
  idMaximumPrice.textContent = !isNaN(valor) && valor !== 0 ? maximumPrice.toFixed(2).replace('.',',') : "Necessário Taxa de Juros";

  const cotacaoAtual = document.getElementById('current-price-' + share).value;
  console.log("Cotacao " + cotacaoAtual + 'current-price-' + share)
  const faceLaugh = document.querySelector('#item-content-' + share + ' .fa-face-laugh-squint');
  const faceSad = document.querySelector('#item-content-' + share + ' .fa-face-sad-cry');
  const faceMeh = document.querySelector('#item-content-' + share + ' .fa-face-meh-blank');
  
  // Esconde todos os ícones inicialmente
  faceLaugh.style.display = 'none';
  faceSad.style.display = 'none';
  faceMeh.style.display = 'none';

  // Calcula a lógica para mostrar o ícone correto com base no preço atual e a média de proventos
  if (cotacaoAtual < maximumPrice) {
    faceLaugh.style.display = 'inline-block'; // Mostra o ícone de felicidade
  } else if (cotacaoAtual > maximumPrice) {
    faceSad.style.display = 'inline-block'; // Mostra o ícone de tristeza
  } else {
    faceMeh.style.display = 'inline-block'; // Mostra o ícone neutro
  }
}