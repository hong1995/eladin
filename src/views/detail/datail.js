import * as Api from '../api.js';

const receivedId = location.href.split('?')[1];
const bookContainer = document.querySelector('.book-container');

const book = await Api.get(`/product/${receivedId}`);
console.log(book);

const { bookName, author, publisher, price, info, imageUrl } = book;

const element = `
  <img src=${imageUrl} class="book-img" alt=${bookName}>
  <div class="book-info">
    <div>
      <p class="title">${bookName}</p>
      <p class="author">저자: ${author}</p>
      <p class="publisher">출판사: ${publisher}</p>
      <p class="price">판매가: ${price}</p>
    </div>
    <hr>
    <div class="book-introduction">
      <p class="intro-title">책 소개</p>
      <p class="intro-content">${info}</p>
    </div>
  </div>
  `;

bookContainer.insertAdjacentHTML('beforeend', element);

// 장바구니, 바로구매 - indexedDB에 현재 상품 데이터 추가
const addCartBtn = document.querySelector('.add-cart');
const buyBtn = document.querySelector('.buy');
addCartBtn.addEventListener('click', addDB);
buyBtn.addEventListener('click', addDB);

function addDB(e) {
  let dbName;

  if (e.target.className.split(' ')[0] === 'add-cart') {
    dbName = 'cartDB';
  } else {
    dbName = 'buyDB';
    location.href = '/order';
  }

  // 1. indexedDB 객체 가져오기
  const indexedDB = window.indexedDB;

  // 2. 브라우저에서 지원하는지 체크하기
  if (!indexedDB) {
    window.alert('해당 브라우저에서는 indexedDB를 지원하지 않습니다.');
  } else {
    const request = indexedDB.open(dbName);

    // objectStore 새로 만들거나 수정할 때 발생하는 이벤트
    request.onupgradeneeded = (e) => {
      console.log('indexedDB.onupgradeneeded');
      let db = e.target.result;

      // product라는 이름으로 objectStore 생성
      let objectStore = db.createObjectStore('product', { keyPath: '_id' });
    };

    request.onsuccess = (e) => {
      let db = e.target.result;
      console.log('success is called', db);

      // product ObjectStore에 읽기쓰기 권한으로 트랜잭션 생성
      let transaction = db.transaction(['product'], 'readwrite');

      transaction.oncomplete = (e) => {
        console.log('done');
      };

      transaction.onerror = (e) => {
        console.log('fail');
      };

      let objectStore = transaction.objectStore('product');

      let request = objectStore.add(book);
      request.onsuccess = (e) => {
        console.log(e.target.result);
      };
    };

    request.onerror = (e) => {
      console.error('indexedDB : ', e.target.errorCode);
    };
  }
}
