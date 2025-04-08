import { useState, useEffect } from 'react';
import './MemoryGame.css';

// Kártyák képei (egyszerű emoji-k)
const cardImages = [
  { src: '🐶', matched: false },
  { src: '🐱', matched: false },
  { src: '🐭', matched: false },
  { src: '🐹', matched: false },
  { src: '🐰', matched: false },
  { src: '🦊', matched: false },
  { src: '🐻', matched: false },
  { src: '🐼', matched: false }
];

function MemoryGame() {
  const [cards, setCards] = useState([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [lives, setLives] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [maxLives, setMaxLives] = useState(20);

  // Kártyák keverése és játék indítása
  const shuffleCards = () => {
    // Duplikáljuk a kártyákat, hogy párokat kapjunk
    const shuffledCards = [...cardImages, ...cardImages]
      // Keverjük meg a kártyákat
      .sort(() => Math.random() - 0.5)
      // Adjunk hozzá egyedi ID-kat
      .map((card, index) => ({ ...card, id: index, matched: false }));
    
    setChoiceOne(null);
    setChoiceTwo(null);
    setCards(shuffledCards);
    setTurns(0);
    setGameWon(false);
    setLives(maxLives);
    setGameOver(false);
  };

  // Következő szint indítása
  const nextLevel = () => {
    setLevel(prevLevel => prevLevel + 1);
    // Minden szinten csökkentjük a maximális életek számát
    setMaxLives(prevMaxLives => Math.max(3, prevMaxLives - 1));
    shuffleCards();
  };

  // Kártya kiválasztása
  const handleChoice = (card) => {
    // Ellenőrizzük, hogy ne lehessen ugyanazt a kártyát kétszer választani
    if (card.id === choiceOne?.id) return;
    
    choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
  };

  // Ellenőrizzük, hogy nyert-e a játékos
  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.matched)) {
      setGameWon(true);
    }
  }, [cards]);

  // Összehasonlítjuk a két kiválasztott kártyát
  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setDisabled(true);
      
      if (choiceOne.src === choiceTwo.src) {
        // Ha egyeznek, jelöljük meg őket
        setCards(prevCards => {
          return prevCards.map(card => {
            if (card.src === choiceOne.src) {
              return { ...card, matched: true };
            } else {
              return card;
            }
          });
        });
        resetTurn();
      } else {
        // Ha nem egyeznek, fordítsuk vissza őket és csökkentsük az életek számát
        setTimeout(() => {
          resetTurn();
          setLives(prevLives => {
            const newLives = prevLives - 1;
            if (newLives === 0) {
              setGameOver(true);
            }
            return newLives;
          });
        }, 1000);
      }
    }
  }, [choiceOne, choiceTwo]);

  // Forduló visszaállítása
  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns(prevTurns => prevTurns + 1);
    setDisabled(false);
  };

  // Automatikusan indítsuk el a játékot betöltéskor
  useEffect(() => {
    shuffleCards();
  }, []);

  return (
    <div className="memory-game">
      <h2>Memória Játék</h2>
      
      <div className="game-info">
        <div className="stats">
          <div className="level">Szint: {level}</div>
          <div className="turns">Lépések: {turns}</div>
          <div className="lives">Életek: {lives}</div>
        </div>
        <button onClick={shuffleCards}>Újrakezdés</button>
      </div>
      
      {gameWon && (
        <div className="game-message game-won">
          <h3>Gratulálunk! Teljesítetted a {level}. szintet!</h3>
          <p>Összes lépés: {turns}</p>
          <p>Megmaradt életek: {lives}</p>
          <button onClick={nextLevel}>Következő szint</button>
          <button onClick={shuffleCards}>Újrakezdés</button>
        </div>
      )}
      
      {gameOver && !gameWon && (
        <div className="game-message game-over">
          <h3>Játék vége!</h3>
          <p>Elfogytak az életek a {level}. szinten.</p>
          <button onClick={shuffleCards}>Újrakezdés</button>
        </div>
      )}
      
      <div className="card-grid">
        {cards.map(card => (
          <div 
            className={`card ${card.matched ? 'matched' : ''} ${choiceOne?.id === card.id || choiceTwo?.id === card.id || card.matched ? 'flipped' : ''}`} 
            key={card.id}
            onClick={() => !disabled && !card.matched && !gameOver && handleChoice(card)}
          >
            <div className="card-front">{card.src}</div>
            <div className="card-back"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MemoryGame;
