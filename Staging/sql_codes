
CREATE DATABASE movieDB;

CREATE TABLE movie (
    movie_id INT PRIMARY KEY,
    original_title TEXT,
    average_rating NUMERIC(3,1),
    status TEXT,
    release_date TEXT,           -- Convert to Date later
    revenue BIGINT,
    runtime INTEGER,
    adult TEXT,
    budget BIGINT,
    overview TEXT,
    poster_path TEXT
);




CREATE TABLE genre (
    genre_id INTEGER PRIMARY KEY,
    genre_name TEXT
);

CREATE TABLE production_company (
    company_id INTEGER PRIMARY KEY,
    company_name TEXT
);

CREATE TABLE language (
    language_id INTEGER PRIMARY KEY,
    language_name TEXT
);

CREATE TABLE director (
    director_id INTEGER PRIMARY KEY,
    director_name TEXT
);

CREATE TABLE writer (
    writer_id INTEGER PRIMARY KEY,
    writer_name TEXT
);

CREATE TABLE cast_member (
    cast_id INTEGER PRIMARY KEY,
    cast_name TEXT
);







CREATE TABLE movie_genre (
    movie_id INT REFERENCES movie(movie_id),
    genre_id INT REFERENCES genre(genre_id),
    PRIMARY KEY (movie_id, genre_id)
);

CREATE TABLE movie_production_company (
    movie_id INT REFERENCES movie(movie_id),
    company_id INTEGER REFERENCES production_company(company_id),
    PRIMARY KEY (movie_id, company_id)
);

CREATE TABLE movie_language (
    movie_id INT REFERENCES movie(movie_id),
    language_id INT REFERENCES language(language_id),
    PRIMARY KEY (movie_id, language_id)
);

CREATE TABLE movie_director (
    movie_id INT REFERENCES movie(movie_id),
    director_id INT REFERENCES director(director_id),
    PRIMARY KEY (movie_id, director_id)
);

CREATE TABLE movie_writer (
    movie_id INT REFERENCES movie(movie_id),
    writer_id INT REFERENCES writer(writer_id),
    PRIMARY KEY (movie_id, writer_id)
);

CREATE TABLE movie_cast (
    movie_id INT REFERENCES movie(movie_id),
    cast_id INT REFERENCES cast_member(cast_id),
    PRIMARY KEY (movie_id, cast_id)
);






-- Loading data from CSV files into the tables

COPY movie(
    movie_id,
    original_title,
    average_rating,
    status,
    release_date,
    revenue,
    runtime,
    adult,
    budget,
    overview,
    poster_path
)
FROM '/Users/adi/Library/CloudStorage/OneDrive-UniversityofBath/CS/Dissertation/Code/Work/Dataset/Tables/movie.csv'
WITH (FORMAT csv, HEADER true);

COPY genre(genre_name, genre_id)
FROM '/Users/adi/Library/CloudStorage/OneDrive-UniversityofBath/CS/Dissertation/Code/Work/Dataset/Tables/genre.csv'
WITH (FORMAT csv, HEADER true);

COPY production_company(company_name, company_id)
FROM '/Users/adi/Library/CloudStorage/OneDrive-UniversityofBath/CS/Dissertation/Code/Work/Dataset/Tables/company.csv'
WITH (FORMAT csv, HEADER true);

COPY language(language_name, language_id)
FROM '/Users/adi/Library/CloudStorage/OneDrive-UniversityofBath/CS/Dissertation/Code/Work/Dataset/Tables/language.csv'
WITH (FORMAT csv, HEADER true);

COPY director(director_name, director_id)
FROM '/Users/adi/Library/CloudStorage/OneDrive-UniversityofBath/CS/Dissertation/Code/Work/Dataset/Tables/director.csv'
WITH (FORMAT csv, HEADER true);

COPY writer(writer_name, writer_id)
FROM '/Users/adi/Library/CloudStorage/OneDrive-UniversityofBath/CS/Dissertation/Code/Work/Dataset/Tables/writer.csv'
WITH (FORMAT csv, HEADER true);

COPY cast_member(cast_name, cast_id)
FROM '/Users/adi/Library/CloudStorage/OneDrive-UniversityofBath/CS/Dissertation/Code/Work/Dataset/Tables/cast.csv'
WITH (FORMAT csv, HEADER true);


-- Loading data from CSV files into the relationship tables

COPY movie_genre(movie_id, genre_id)
FROM '/Users/adi/Library/CloudStorage/OneDrive-UniversityofBath/CS/Dissertation/Code/Work/Dataset/Relationship_tables/movie_genre.csv'
WITH (FORMAT csv, HEADER true);

COPY movie_production_company(movie_id, company_id)
FROM '/Users/adi/Library/CloudStorage/OneDrive-UniversityofBath/CS/Dissertation/Code/Work/Dataset/Relationship_tables/movie_production_company.csv'
WITH (FORMAT csv, HEADER true);

COPY movie_language(movie_id, language_id)
FROM '/Users/adi/Library/CloudStorage/OneDrive-UniversityofBath/CS/Dissertation/Code/Work/Dataset/Relationship_tables/movie_language.csv'
WITH (FORMAT csv, HEADER true);

COPY movie_director(movie_id, director_id)
FROM '/Users/adi/Library/CloudStorage/OneDrive-UniversityofBath/CS/Dissertation/Code/Work/Dataset/Relationship_tables/movie_director.csv'
WITH (FORMAT csv, HEADER true);

COPY movie_writer(movie_id, writer_id)
FROM '/Users/adi/Library/CloudStorage/OneDrive-UniversityofBath/CS/Dissertation/Code/Work/Dataset/Relationship_tables/movie_writer.csv'
WITH (FORMAT csv, HEADER true);

COPY movie_cast(movie_id, cast_id)
FROM '/Users/adi/Library/CloudStorage/OneDrive-UniversityofBath/CS/Dissertation/Code/Work/Dataset/Relationship_tables/movie_cast.csv'
WITH (FORMAT csv, HEADER true);
