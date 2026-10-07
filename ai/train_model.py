# First model (practice)
import pandas as pd
from sklearn.linear_model import LogisticRegression

data = pd.read_csv("ai/training_data.csv")

# features (info which our model receives)
X = data[["interest_match", "budget_fit", "rating"]]
# target (what we want Model to predict)
Y = data["added_to_trip"]

model = LogisticRegression()
model.fit(X, Y)

print("Model trained successfully")
for feature, coefficient in zip(X.columns, model.coef_[0]):
	print(feature, ": ", coefficient)
print("intercept: ", model.intercept_[0])

# new place, model doesn't know
new_place = pd.DataFrame([{
	"interest_match": 1,
	"budget_fit": 0,
	"rating": 4.7
}])

probability = model.predict_proba(new_place)[0][1]
print("Probability of adding to trip: ", probability)