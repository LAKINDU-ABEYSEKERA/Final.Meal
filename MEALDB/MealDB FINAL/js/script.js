let spinner = document.getElementById("loadingSpinner");
let alertContainer = document.getElementById("alertContainer");
let mealResultsDiv = document.getElementById("mealResults");
let mealDetailsDiv = document.getElementById("mealDetails");
let categorySelect = document.getElementById("categorySelect");
let ingredientSelect = document.getElementById("ingredientSelect");
let areaSelect = document.getElementById("areaSelect");

window.onload = function () {
    loadAreas();
    loadCategories();
    loadIngredients();
};

function searchMeal() {
    let mealName = document.getElementById("txtSearchInput").value.trim();
    if (!mealName) {
        showError("Please enter a meal name!");
        return;
    }

    spinner.classList.remove("d-none");

    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${mealName}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (!data.meals) {
                showError("No meals found with that name.");
                return;
            }
            showMeals(data.meals);
        })
        .catch(error => {
            console.error(error);
            showError("Something went wrong!");
        })
        .finally(() => {
            spinner.classList.add("d-none");
            document.getElementById("txtSearchInput").value = "";
        });
}
function filterByCategory() {
    const category = categorySelect.value;
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            showMeals(data.meals);
            console.log("Meals filtered by category:", category, data.meals);
            categorySelect.addEventListener("change", filterByCategory);

        })
        .catch(error => {
            console.error(error);
            showError("Something went wrong while filtering by category!");
        });

}

function filterByArea() {
    const area = areaSelect.value;
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            showMeals(data.meals);
            console.log("Meals filtered by area:", area, data.meals);
            areaSelect.addEventListener("change", filterByArea);

        })
        .catch(error => {
            console.error(error);
            showError("Something went wrong while filtering by area!");
        });
}

function filterByIngredient() {
    const ingredient = ingredientSelect.value;
    
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            showMeals(data.meals);
            console.log("Meals filtered by ingredient:", ingredient, data.meals);
            ingredientSelect.addEventListener("change", filterByIngredient);

        })
        .catch(error => {
            console.error(error);
            showError("Something went wrong while filtering by ingredient!");
        });
}

function showMeals(meals) {
    if (!meals) {
        mealResultsDiv.innerHTML = `<p class="text-light">No meals found.</p>`;
        return;
    }

    let mealHTML = meals.map(element => `
        <div class="meal-card">
            <div class="meal-img">
                <img src="${element.strMealThumb}" alt="${element.strMeal}">
            </div>
            <div class="meal-info">
                <h5>${element.strMeal}</h5>
                <button onclick="getMealDetails(${element.idMeal})">View Details</button>
            </div>
        </div>
    `).join('');

    mealResultsDiv.innerHTML = `<div class="meal-grid">${mealHTML}</div>`;
    mealResultsDiv.scrollIntoView({ behavior: 'smooth' });
}

function getRandomMeal() {
  fetch("https://www.themealdb.com/api/json/v1/1/random.php")
    .then(response => response.json())
    .then(data => {
      if (data.meals) {
        getMealDetails(data.meals[0].idMeal); 
        console.log(data);
        
        document.getElementById("mealDetails").scrollIntoView({ behavior: "smooth" });
      }
    })
    .catch(error => console.error("Error fetching random meal:", error));
}

function getMealDetails(id) {
    spinner.classList.remove("d-none");

    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (!data.meals) {
                showError("Meal details not found.");
                return;
            }

            const meal = data.meals[0];
            let ingredientsList = "";

            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                if (ingredient && ingredient.trim() !== "") {
                    ingredientsList += `<li>${ingredient} - ${measure}</li>`;
                }
            }

            mealDetailsDiv.innerHTML = `
<div class="container py-5">
  <div class="recipe-card">
    <div class="row g-4 align-items-start">
      
      <div class="col-md-4">
        <img src="${meal.strMealThumb}" class="img-fluid rounded" alt="${meal.strMeal}">
      </div>

      <div class="col-md-8">
        <h2 class="text-warning">${meal.strMeal}</h2>
        <p><b>Category:</b> ${meal.strCategory}</p>
        <p><b>Area:</b> ${meal.strArea}</p>

        <div class="mb-3">
          <h4>Ingredients</h4>
          <ul>${ingredientsList}</ul>
        </div>

   
        <div>
          <h4>Instructions</h4>
          <p>${meal.strInstructions}</p>
        </div>
      </div>

    </div>
  </div>
</div>
`;

            mealDetailsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        })
        .catch(error => {
            console.error(error);
            showError("Something went wrong while fetching meal details!");
        })
        .finally(() => {
            spinner.classList.add("d-none");
        });
}

function loadCategories() {
    fetch("https://www.themealdb.com/api/json/v1/1/list.php?c=list")
        .then(res => res.json())
        .then(data => {
            data.meals.forEach(item => {
                const option = document.createElement("option");
                option.value = item.strCategory;
                option.text = item.strCategory;
                categorySelect.appendChild(option);
            });
        })
        .catch(() => showError("Failed to load categories"));
}

function loadAreas() {
    fetch("https://www.themealdb.com/api/json/v1/1/list.php?a=list")
        .then(res => res.json())
        .then(data => {
            data.meals.forEach(item => {
                const option = document.createElement("option");
                option.value = item.strArea;
                option.text = item.strArea;
                areaSelect.appendChild(option);
            });
        })
        .catch(() => showError("Failed to load areas"));
}

function loadIngredients() {
    fetch("https://www.themealdb.com/api/json/v1/1/list.php?i=list")
        .then(res => res.json())
        .then(data => {
            data.meals.forEach(item => {
                const option = document.createElement("option");
                option.value = item.strIngredient;
                option.text = item.strIngredient;
                ingredientSelect.appendChild(option);
            });
        })
        .catch(() => showError("Failed to load ingredients"));
}

function showError(message, timeout = 3000) {
    let alert = document.createElement("div");
    alert.className = "alert alert-danger alert-dismissible fade show";
    alert.role = "alert";
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alert);

    setTimeout(() => {
        alert.classList.remove("show");
        alert.classList.add("hide");
        alert.addEventListener("transitionend", () => alert.remove());
    }, timeout);
}