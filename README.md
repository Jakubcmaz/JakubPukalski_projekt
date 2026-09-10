ADCC Champions Ranking
1. Cel projektu
Stworzenie responsywnej aplikacji webowej typu Single Page Application (SPA), która prezentuje historyczny ranking mistrzów świata ADCC (Submission Fighting World Championships). Aplikacja skupia się wyłącznie na zawodnikach, którzy zdobyli przynajmniej jeden medal, prezentując liczbę ich tytułów oraz szczegółową historię zwycięstw.
2. Technologie
HTML5: Semantyczna struktura dokumentu.
CSS3: Nowoczesny design z wykorzystaniem zmiennych (:root), Flexbox, responsywny układ (RWD) dopasowany do urządzeń mobilnych.
JavaScript: Dynamiczne renderowanie tabeli, obsługa wyszukiwarki w czasie rzeczywistym oraz sortowanie danych.
Zewnętrzne zasoby: Czcionki Google Fonts (Montserrat) oraz ikony FontAwesome.
3. Architektura i struktura plików
Projekt można zamknąć w jednym pliku lub podzielić modułowo:
Plaintext


adcc-champions-ranking/
│
├── index.html       
├── style.css       
├── script.js           
└── README.md      

4. Wymagania funkcjonalne
Tabela rankingowa: Prezentacja zawodników z kolumnami: Pozycja, Zawodnik, Klub/Kraj, Liczba złotych medali oraz Historia zwycięstw (rok i kategoria).
Wyszukiwarka tekstowa: Filtrowanie zawodników w czasie rzeczywistym po imieniu, nazwisku, klubie, kraju lub konkretnym roku zwycięstwa.
Wyróżnienie czołgowych miejsc: Specjalne stylowanie dla pierwszych trzech pozycji w rankingu.
5. Etapy realizacji (Roadmap)
Faza I (Szkielet i Design):
Stworzenie układu HTML z nagłówkiem i panelem sterowania.
Ostylowanie strony w ciemnej palecie barw z akcentami charakterystycznymi dla organizacji ADCC.
Faza II (Struktura Danych):
Przygotowanie tablicy obiektów w JavaScript zawierającej zweryfikowane dane mistrzów (np. Gordon Ryan, Andre Galvao, Marcelo Garcia).
Faza III (Logika i Interaktywność):
Napisanie funkcji dynamicznie generującej wiersze tabeli na podstawie bazy danych.
Implementacja nasłuchiwania zdarzeń dla wyszukiwarki.
Faza IV (Testy i Optymalizacja):
Sprawdzenie responsywności na smartfonach i tabletach.
Walidacja poprawności danych historycznych.
