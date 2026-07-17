import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.decomposition import PCA
from sklearn.linear_model import Ridge
from sklearn.preprocessing import PolynomialFeatures

df = pd.read_csv('dataset/boston_housing.csv')
feature_names = ['crim','zn','indus','chas','nox','rm','age',
                 'dis','rad','tax','ptratio','b','lstat']
data = df[feature_names].values
target = df['medv'].values

data_train, data_test, target_train, target_test = train_test_split(
    data, target, test_size=0.2, random_state=42)

pca = PCA(n_components=2)
data_train_pca = pca.fit_transform(data_train)
data_test_pca = pca.transform(data_test)

poly = PolynomialFeatures(degree=2, include_bias=False)
data_train_poly = poly.fit_transform(data_train)
data_test_poly = poly.transform(data_test)

ridge_no_pca = Ridge(alpha=1.0)
ridge_no_pca.fit(data_train, target_train)

ridge_pca = Ridge(alpha=1.0)
ridge_pca.fit(data_train_pca, target_train)

ridge_poly = Ridge(alpha=1.0)
ridge_poly.fit(data_train_poly, target_train)

os.makedirs('model', exist_ok=True)
joblib.dump(ridge_no_pca, 'model/ridge_no_pca.joblib')
joblib.dump(ridge_pca,    'model/ridge_pca.joblib')
joblib.dump(ridge_poly,   'model/ridge_poly.joblib')
joblib.dump(pca,          'model/pca_transformer.joblib')
joblib.dump(poly,         'model/poly_transformer.joblib')
joblib.dump(feature_names,'model/feature_names.joblib')
print("All models saved successfully.")
