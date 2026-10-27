import pandas as pd

# loading Data
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

# Users with all ratings completed
complete_mask = valid_ratings.notna().all(axis=1)

# reference group
reference_users = valid_ratings.loc[~complete_mask].copy()

# test group
test_users = valid_ratings.loc[complete_mask].copy()

# _______________
# Baseline Model - average rating per category

# calculate average for each category
baseline_ratings = reference_users.mean()

print("\nBaseline average ratings: ")
print(baseline_ratings.round(2))
# _______________

def calculate_distance(user_a, user_b):
	# finding categories rated by both users
	common = user_a.notna() & user_b.notna()
	if common.sum() < 3:
	   return None 

	difference = (user_a[common] - user_b[common]).abs().mean()

	return difference

def predict_rating(test_user, category, k=5):
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
	
# test our prediction function
# errors = []
# # test all 129 users
# for user_index, test_user in test_users.iterrows():
# # for user_index, test_user in test_users.head(3).iterrows():
# # test all 24 categories for each user
# 	for category in test_users.columns:
# 		actual = test_user[category]
# 		predicted = predict_rating(test_user, category)

# 		if predicted is not None:
# 			error = abs(actual - predicted)
# 			errors.append(error)
# 			# print(category, "Error: ", round(error, 2))
# 		# else:
# 		# 	print(category, "Prediction unavailable")

# if errors:
# 	mae = sum(errors) / len(errors)
# 	print("\nOverall MAE: ", round(mae, 2))
# 	print("Total predictions:", len(errors))

# _______
# Evaluate baseline model

baseline_errors=[]
# compare baseline predictions with actual test ratings
for user_index, test_user in test_users.iterrows():

	for category in test_users.columns:
		# actual rating from test user
		actual = test_user[category]

		# baseline prediction: avg category rating
		predicted = baseline_ratings[category]

		# calculate absolute error
		error = abs(actual - predicted)
		baseline_errors.append(error)

baseline_mae = sum(baseline_errors) / len(baseline_errors)

print("\nBaseline MAE: ", round(baseline_mae, 2))
print("Total predictions: ", len(baseline_errors))
# _______

