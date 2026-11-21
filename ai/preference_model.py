"""
Module Name: AI Preference Recommendation Model
File: ai/preference_model.py
Date: November 2026
Programmer: Tatiana Cherbaeva

Description:
    Implements user-based collaborative filtering to predict
    user ratings for travel-related place categories.

Important Functions:
    calculate_distance(user_a, user_b):
        Input: Two pandas Series containing user ratings.
        Output: Mean absolute difference between ratings
        in shared categories, or None if fewer than three
        categories overlap.

    predict_rating(test_user, category, k=5):
        Input: User ratings, target category, and number
        of nearest neighbors.
        Output: Predicted rating or None if no suitable
        neighbors are found.

Important Data Structures:
    pandas DataFrame:
        Stores ratings for 24 place categories.

    pandas Series:
        Represents individual user ratings and category
        averages used by the baseline model.

    list of tuples:
        Stores reference user indices and rating distances
        used to identify the nearest neighbors.

Algorithm:
    User-based Collaborative Filtering with K-Nearest
    Neighbors (KNN).

    The model finds similar users by comparing ratings
    in shared categories. It predicts missing ratings
    using the average ratings of the nearest neighbors.

    This approach was selected because it uses existing
    user preference data and does not require labeled
    recommendation outcomes.
"""

import pandas as pd 
# -------- Loading Data and preprocessing --------
data = pd.read_csv("ai/google_review_ratings_data.csv")

# removing empty column
data = data.drop(columns=["Unnamed: 25"])

# creating proper names for categories
data = data.rename(columns={
	"User": "user_id",
	"Category 1" : "churches",
	"Category 2" : "resorts",
	"Category 3" : "beaches",
	"Category 4" : "parks",
	"Category 5" : "theatres",
	"Category 6" : "museums",
	"Category 7" : "malls",
	"Category 8" : "zoo",
	"Category 9" : "restaurants",
	"Category 10" : "pubs_bars",
	"Category 11" : "local services",
	"Category 12" : "burger_pizza",
	"Category 13" : "hotels",
	"Category 14" : "juice_bars",
	"Category 15" : "art_galleries",
	"Category 16" : "dance_clubs",
	"Category 17" : "swimming_pools",
	"Category 18" : "gyms",
	"Category 19" : "bakeries",
	"Category 20" : "beauty_spas",
	"Category 21" : "cafes",
	"Category 22" : "view_points",
	"Category 23" : "monuments",
	"Category 24" : "gardens"
})

# prepeare rating data for reference and test groups
ratings = data.drop(columns=["user_id"])

# converting all ratings to numeric values
ratings = ratings.apply(pd.to_numeric, errors="coerce")

# keeping only valid ratings (1-5)
valid_ratings = ratings.where(
	(ratings >=1) & (ratings <=5)
)

# Users with all ratings completed for testing and other profiles as reference users
complete_mask = valid_ratings.notna().all(axis=1)

# reference group
reference_users = valid_ratings.loc[~complete_mask].copy()
# test group
test_users = valid_ratings.loc[complete_mask].copy()

# Baseline: mean reference rating for each category
baseline_ratings = reference_users.mean()

# -------- Collaborative filtering --------

def calculate_distance(user_a, user_b):
	"""Calculate mean absolute rating difference on shared categories.

	Args:
		user_a (pd.Series): Ratings for the first user.
		user_b (pd.Series): Ratings for the second user.

	Returns:
		float or None: Average absolute difference, or None when fewer
		than three categories have ratings from both users.
	"""

	# finding categories rated by both users
	common = user_a.notna() & user_b.notna()
	if common.sum() < 3:
		return None
	 
	difference = (user_a[common] - user_b[common]).abs().mean()
	return difference

def predict_rating(test_user, category, k=5):
	"""Predict a category rating from the k closest reference users.

	The target category is hidden before comparing user profiles.

	Args:
		test_user (pd.Series): Known ratings for the target user.
		category (str): Category whose rating should be predicted.
		k (int): Maximum number of nearest neighbors; defaults to 5.

	Returns:
		float or None: Average neighbor rating, or None if no eligible
		reference users are found.
	"""
	user = test_user.copy()
	# hide the actual rating
	user[category] = float("nan")
	distances = []

	# comparing test user & reference user
	for index, reference_user in reference_users.iterrows():
		# skip users who haven't rated this category
		if pd.isna(reference_user[category]):
			continue

		distance = calculate_distance(user,reference_user)
		if distance is not None:
			distances.append((index, distance))
		
	# sort - smallest first
	distances.sort(key=lambda x: x[1])
	# top closest users
	nearest_neighbors = distances[:k]
	# predict hidden rating using similar users
	neighbor_ratings = []
	for user_index, distance in nearest_neighbors:
		#get the category rating from each neighbor
		rating = reference_users.loc[user_index, category]
		# ignore missing ratings
		if pd.notna(rating):
			neighbor_ratings.append(float(rating))

	# check if we found neighbors with ratings
	if not neighbor_ratings:
		return None
	# calculate predicted rating
	predicted_rating = sum(neighbor_ratings) / len(neighbor_ratings)
	return predicted_rating


# -------- Optional evaluation experiments(not run automatically) ------

def evaluate_baseline():
	"""Evaluate mean-category baseline predictions on complete test users.

	Returns:
		dict: MAE and number of predictions.
	"""

	errors = []
	# compare baseline predictions with actual test ratings
	for _, test_user in test_users.iterrows():
		for category in test_users.columns:
			# actual rating from test user
			actual = test_user[category]
			# baseline prediction: avg category rating
			predicted = baseline_ratings[category]
			errors.append(abs(actual - predicted))

	return {
		"mae": sum(errors) / len(errors) if errors else None,
		"total_predictions": len(errors),
	}

def evaluate_collaborative_filtering(k=5):
	"""Evaluate CF by hiding each rating in otherwise complete profiles.

	Args:
		k (int): Maximum number of neighbors; defaults to 5.

	Returns:
		dict: MAE and number of successful predictions.
	"""

	errors = []
	for _, test_user in test_users.iterrows():
		for category in test_users.columns:
			predicted = predict_rating(test_user, category, k=k)
			if predicted is not None:
				errors.append(abs(test_user[category] - predicted))

	return {
		"mae": sum(errors) / len(errors) if errors else None,
		"total_predictions": len(errors),
	}

def evaluate_sparse_references(num_known=5, seed=100):
	"""Evaluate CF with a limited number of randomly known categories.

	Args:
		num_known (int): Number of known categories for each test user.
		seed (int): Base random seed used for reproducible selections.

	Returns:
		dict: MAE, test user count, total possible and successful
		predictions, and prediction coverage percentage.
	"""

	errors = []
	total_predictions = 0
	total_possible = 0
	for user_index, test_user in test_users.iterrows():
		# Randomly select the specified number of  known categories
		known_categories = test_users.columns.to_series().sample(n=num_known, random_state=seed + user_index).tolist()
		# Create a new user profile
		new_user = pd.Series(float("nan"), index=test_users.columns)
		for category in known_categories:
			new_user[category] = test_user[category]

		# Predict all unknown categories
		for category in test_users.columns:
			if category in known_categories:
				continue

			total_possible += 1
			predicted = predict_rating(new_user, category)
			actual = test_user[category]
			if predicted is not None:
				errors.append(abs(actual - predicted))
				total_predictions += 1

	return {
		"known_preferences": num_known,
		"test_users": len(test_users),
		"mae": sum(errors) / len(errors) if errors else None,
		"total_possible": total_possible,
		"total_predictions": total_predictions,
		"coverage": total_predictions / total_possible * 100 if total_possible else 0,
	}

# Run evaluations manually when needed; normal imports do not run experiments.