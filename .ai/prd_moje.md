# Dokument wymagań produktu (PRD) - 10xCards

## 1. Przegląd produktu
10xCards to webowa aplikacja umożliwiająca studentom i uczniom szybkie generowanie i zarządzanie fiszkami edukacyjnymi z wykorzystaniem sztucznej inteligencji (modele LLM poprzez API). Celem jest skrócenie czasu tworzenia fiszek, zwiększenie zaangażowania w metodę spaced repetition oraz ułatwienie nauki.

## 2. Problem użytkownika
Ręczne tworzenie wysokiej jakości fiszek jest czasochłonne i zniechęca użytkowników do korzystania z efektywnego algorytmu powtórek. Użytkownicy potrzebują narzędzia, które automatycznie wygeneruje propozycje fiszek na podstawie wprowadzonego tekstu oraz pozwoli na szybkie recenzowanie i zapis.

## 3. Wymagania funkcjonalne
1. Rejestracja i logowanie
   - rejestracja przy użyciu emaila i hasła
   - potwierdzenie konta i reset hasła przez link email
2. Wklejanie surowego tekstu
   - zakres długości od 1000 do 10 000 znaków
   - walidacja po stronie frontendu, backendu i bazy danych z odpowiednimi komunikatami
3. Generowanie fiszek przez AI:
   - Użytkownik wkleja dowolny tekst (np. fragment podręcznika).
   - Aplikacja wysyła tekst do modelu LLM za pośrednictwem API.
   - Model LLM proponuje zestaw fiszek (pytania i odpowiedzi).
   - Fiszki są przedstawiane użytkownikowi w formie listy z możliwością akceptacji, edycji lub odrzucenia.
4. Recenzja proponowanych fiszek
   - wyświetlanie listy kandydatów w kolejności dodawania
   - akcje zaakceptuj, edytuj, odrzuć dla każdego kandydata
   - kandydatury zapisywane do bazy tylko po kliknięciu „Zapisz”
   - edytowane kandydatury traktowane jako zaakceptowane w KPI, z logowaniem zmian
5. Regeneracja propozycji
   - przycisk „Regeneruj” dopisuje nowe karty poniżej istniejącej listy
6. Manualne tworzenie fiszek
   - formularz dodawania front (max 200 znaków) i back (max 500 znaków)
   - walidacja długości analogiczna jak dla AI
7. Zarządzanie zapisanymi fiszkami
   - przeglądanie biblioteki fiszek
   - edycja front/back zapisanych kart
   - usuwanie fiszek dostępne tylko dla właściciela
8. Logowanie zdarzeń generowania
   - tabele generation_requests i candidates z polami: request_id, candidate_id, status (generated/accepted/edited/rejected), input_text, front, back, timestamps
9. Obsługa błędów AI
   - przyjazny komunikat w UI w razie błędu generowania
   - zapisywanie szczegółów błędu w logach

## 4. Granice produktu
- brak własnego, zaawansowanego algorytmu powtórek (wykorzystanie prostego, zewnętrznego modułu poza MVP)
- brak importu wielu formatów (PDF, DOCX itp.)
- brak współdzielenia zestawów między użytkownikami
- brak integracji z innymi platformami edukacyjnymi
- brak aplikacji mobilnych (tylko web)

## 5. Historyjki użytkowników
- US-001
  Tytuł: Rejestracja nowego użytkownika
  Opis: Jako nowy użytkownik chcę zarejestrować się przy użyciu emaila i hasła, aby mieć dostęp do aplikacji.
  Kryteria akceptacji:
  - w przypadku podania prawidłowego emaila i hasła konto zostaje utworzone i wysyłany jest e-mail potwierdzający
  - przy podaniu istniejącego emaila wyświetlany jest komunikat o duplikacie
  - przy nieprawidłowym formacie emaila lub pustym haśle wyświetlane są odpowiednie komunikaty o błędzie

- US-002
  Tytuł: Logowanie użytkownika
  Opis: Jako zarejestrowany użytkownik chcę się zalogować, aby uzyskać dostęp do tworzenia i przeglądania fiszek.
  Kryteria akceptacji:
  - przy podaniu prawidłowych danych uwierzytelnianie przebiega pomyślnie i użytkownik jest przekierowany do pulpitu
  - przy nieprawidłowym emailu/haśle wyświetlany jest komunikat o błędnych danych

- US-003
  Tytuł: Resetowanie hasła
  Opis: Jako użytkownik chcę zresetować hasło, gdy je zapomnę, poprzez otrzymanie linku na email.
  Kryteria akceptacji:
  - użytkownik może zainicjować reset, podając swój email
  - system wysyła link resetujący hasło na podany email
  - przy nieznalezieniu emaila wyświetlany jest komunikat o nieistniejącym koncie

- US-004
  Tytuł: Wklejanie tekstu i generowanie fiszek przez AI
  Opis: Jako zalogowany użytkownik chcę wkleić surowy tekst (1000–10 000 znaków), aby system wygenerował propozycje fiszek.
  Kryteria akceptacji:
  - przy tekście poniżej 1000 lub powyżej 10 000 znaków generowanie jest zablokowane z komunikatem o błędzie
  - przy prawidłowym tekście wyzwalane jest żądanie API i wyświetlana lista kandydatów

- US-005
  Tytuł: Akceptacja proponowanej fiszki
  Opis: Jako użytkownik chcę zaakceptować propozycję fiszki od AI, aby dodać ją do bazy.
  Kryteria akceptacji:
  - po kliknięciu „Zaakceptuj” karta zmienia status na accepted i pojawia się w podsumowaniu
  - zatwierdzona karta jest zapisana po kliknięciu „Zapisz”

- US-006
  Tytuł: Edycja propozycji fiszki AI
  Opis: Jako użytkownik chcę edytować front lub back propozycji, aby dopasować treść przed zapisaniem.
  Kryteria akceptacji:
  - pole front/back jest edytowalne na liście kandydatów
  - po modyfikacji karta zmienia status na edited i zachowuje się jak zaakceptowana w KPI

- US-007
  Tytuł: Odrzucenie propozycji fiszki AI
  Opis: Jako użytkownik chcę odrzucić nieodpowiadające propozycje, aby usunąć je z listy kandydatów.
  Kryteria akceptacji:
  - po kliknięciu „Odrzuć” propozycja znika z widoku kandydatów i jest logowana jako rejected

- US-008
  Tytuł: Zapisanie zaakceptowanych fiszek
  Opis: Jako użytkownik chcę zapisać wszystkie zaakceptowane karty jednocześnie, aby trafiły do mojej biblioteki.
  Kryteria akceptacji:
  - przy kliknięciu „Zapisz” wszystkie zaakceptowane i edytowane kartu zostają zapisane w bazie
  - po zapisie użytkownik widzi komunikat o sukcesie i przechodzi do biblioteki

- US-009
  Tytuł: Regeneracja propozycji
  Opis: Jako użytkownik chcę wygenerować kolejne propozycje i zobaczyć je poniżej istniejącej listy.
  Kryteria akceptacji:
  - po kliknięciu „Regeneruj” nowe propozycje są dopisywane na końcu listy
  - wcześniejsze zaakceptowane, edytowane i odrzucone pozostają nienaruszone

- US-010
  Tytuł: Manualne tworzenie fiszki
  Opis: Jako użytkownik chcę dodać własną fiszkę z front (max 200 znaków) i back (max 500 znaków), gdy AI nie wygeneruje odpowiedniej.
  Kryteria akceptacji:
  - formularz tworzenia pozwala wprowadzić front i back w określonych limitach
  - przy próbie przekroczenia limitu długości wyświetlane są komunikaty o błędzie

- US-011
  Tytuł: Przegląd zapisanych fiszek
  Opis: Jako użytkownik chcę przeglądać listę moich zapisanych fiszek w bibliotece.
  Kryteria akceptacji:
  - użytkownik widzi wszystkie zapisane karty w kolejności dodania
  - w widoku karty dostępne są akcje edycji i usuwania

- US-012
  Tytuł: Edycja zapisanej fiszki
  Opis: Jako użytkownik chcę zmodyfikować front lub back zapisanej karty.
  Kryteria akceptacji:
  - przy kliknięciu „Edytuj” pola front/back stają się edytowalne
  - po zapisaniu zmian karta zachowuje nowe treści i jest logowana jako edited

- US-013
  Tytuł: Usunięcie zapisanej fiszki
  Opis: Jako użytkownik chcę usunąć moją fiszkę, aby oczyścić bibliotekę.
  Kryteria akceptacji:
  - przy kliknięciu „Usuń” pojawia się potwierdzenie
  - po potwierdzeniu karta zostaje usunięta z bazy
  - użytkownik nie może usunąć fiszki należącej do innego użytkownika

- US-014
  Tytuł: Obsługa błędu generowania AI
  Opis: Jako użytkownik chcę zobaczyć przyjazny komunikat, gdy generowanie fiszek zakończy się błędem.
  Kryteria akceptacji:
  - w przypadku błędu API wyświetlany jest komunikat zachęcający do ponowienia próby
  - szczegóły błędu są zapisywane w tabeli logów

- US-015
  Tytuł: Walidacja długości i dynamiczny licznik
  Opis: Jako użytkownik chcę widzieć licznik znaków podczas wklejania tekstu lub edytowania front/back, aby nie przekroczyć limitów.
  Kryteria akceptacji:
  - licznik aktualizuje się podczas wpisywania
  - przy osiągnięciu 90% limitu kolor licznika zmienia się na ostrzegawczy
  - nie można przekroczyć 100% limitu, przy próbie przekroczenia wyświetlany jest komunikat i blokowane jest dalsze wpisywanie

## 6. Metryki sukcesu
1. wskaźnik globalnej akceptacji AI (zaakceptowane i edytowane / wygenerowane) ≥ 75%
2. udział fiszek tworzonych przez AI (AI-generated / wszystkie zapisane) ≥ 75%
3. monitorowanie w tabeli logów generation_requests i candidates statusów generowania, akceptacji, edycji i odrzuceń 