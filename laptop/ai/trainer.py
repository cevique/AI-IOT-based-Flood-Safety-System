import numpy as np
from sklearn.linear_model import LogisticRegression
import joblib

# Example: X = features, y = labels
X_train = np.random.rand(20, 3)  # mean, trend, std
y_train = np.random.randint(0, 2, 20)

model = LogisticRegression()
model.fit(X_train, y_train)
joblib.dump(model, "logreg_v1.joblib")
print("Model saved!")
