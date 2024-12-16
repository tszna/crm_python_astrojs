# Aplikacja do zarządzania czasem pracy. API - python, front - astro.js

Jest to prosta aplikacja, która pozwala liczyć swój czas pracy. Liczba sesji pracy w ciągu dnia jest dowolna. Aplikacja pozwala przejrzeć swoje podsumowanie tygodnia, w którym jest napisane ile czasu danego dnia się pracowało oraz ile czasu się przepracowało w danym tygodniu. W podsumowaniu czasu pracy jest również lista użytkowników, dzięki której można sprawdzić czy dany kolega z pracy dzisiaj pracuje czy nie. Jest to komunikowane poprzez kropkę, która zapala się na żółto jeśli dany kolega z pracy obecnie pracuje. Aplikacja pozwala również przejrzeć swój i kolegów z pracy kalendarz nieobecności, dzięki któremu można się zorientować kiedy ma się jaką nieobecność oraz kiedy można się spodziewać kolegi z pracy, który aktualnie nie pracuje, a który jest potrzebny do konsultacji przy bieżącym projekcie.

Formularz logowania:
<img src="https://i.imgur.com/5EqwIvS.gif">
Licznik czasu pracy:
<img src="https://i.imgur.com/rncEHY2.gif">
Podsumowanie tygodnia:
<img src="https://i.imgur.com/hFQSwQk.gif">
Kalendarz:
<img src="https://i.imgur.com/uyLbqHY.gif">
<h4>Uruchomienie projektu</h4>
Należy upewnić się, czy dane dostępowe do bazy danych w pliku app\db\database.py zgadzają się z ustawieniami systemowej bazy danych, jeśli tak, to w głównym katalogu API należy wpisać w terminalu komendy:
<pre><code>python -m venv venv</code></pre>
<pre><code>.\venv\Scripts\activate</code></pre>
<pre><code>pip install -r requirements.txt</code></pre>
Następne komendy dodadzą tabele do bazy danych i użytkowników.
<pre><code>python init_db.py</code></pre>
<pre><code>python seed_user.py</code></pre>
Od teraz można logować się za pomocą danych: jan.kowalski@example.com:haslo123

Można uruchomić API przy pomocy komendy:
<pre><code>uvicorn main:app --reload</code></pre>
Jeśli chodzi o front, to należy w katalogu zawierającym pliki źródłowe frontu wpisać komendy:
<pre><code>npm install</code></pre>
<pre><code>npm run dev</code></pre>