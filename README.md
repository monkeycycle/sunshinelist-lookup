


```

UPDATE sunshine_list_on SET combined = CONCAT(year, ' ', firstname, ' ', lastname, ' ', department, ' ', position, ' ', salary, ' ', benefits);


-- old table naming convention moved forward, 2016 is actually reporting on 2015 disclosure
SELECT count(*) FROM sunshine_list_on WHERE year = '2013'
SELECT count(*) FROM sunshine_list_on WHERE year = '2014'
SELECT count(*) FROM sunshine_list_on WHERE year = '2015'
SELECT count(*) FROM sunshine_list_on WHERE year = '2016'


SELECT `id`, `year`, `firstname`, `salary`, `benefits`, (`salary` + `benefits`) AS `TotalCompensation`
 FROM sunshine_list_on
WHERE `id` != ''



SELECT (SUM(salary)) AS Salary
 FROM sunshine_list_on
 GROUP BY year

SELECT (SUM(benefits)) AS Benefits
 FROM sunshine_list_on
 GROUP BY year

SELECT year, (SUM(salary) + SUM(benefits)) AS TotalCompensation
 FROM sunshine_list_on
 GROUP BY year

SELECT Department, (SUM(salary) + SUM(benefits)) AS TotalCompensation
 FROM sunshine_list_on
 WHERE `year` = '2016'
 GROUP BY Department

SELECT Department, count(*)
 FROM sunshine_list_on
 WHERE `year` = '2016'
 GROUP BY Department


```
