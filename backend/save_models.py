import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.linear_model import Ridge
from sklearn.preprocessing import PolynomialFeatures

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)
CSV_PATH = os.path.join(PARENT_DIR, 'dataset', 'boston_housing.csv')
MODEL_DIR = os.path.join(BASE_DIR, 'model')
os.makedirs(MODEL_DIR, exist_ok=True)

df = pd.read_csv(CSV_PATH)
feature_names = ['crim','zn','indus','chas','nox','rm','age','dis','rad','tax','ptratio','b','lstat']
data = df[feature_names].values
target = df['medv'].values

data_train, data_test, target_train, target_test = train_test_split(
    data, target, test_size=0.2, random_state=42)

pca = PCA(n_components=2)
data_train_pca = pca.fit_transform(data_train)
data_test_pca = pca.transform(data_test)

tsne = TSNE(n_components=2, random_state=42)
data_train_tsne = tsne.fit_transform(data_train)

poly = PolynomialFeatures(degree=2, include_bias=False)
data_train_poly = poly.fit_transform(data_train)
data_test_poly = poly.transform(data_test)

ridge_no_pca = Ridge(alpha=1.0)
ridge_no_pca.fit(data_train, target_train)

ridge_pca = Ridge(alpha=1.0)
ridge_pca.fit(data_train_pca, target_train)

ridge_poly = Ridge(alpha=1.0)
ridge_poly.fit(data_train_poly, target_train)

joblib.dump(ridge_no_pca, os.path.join(MODEL_DIR, 'ridge_no_pca.joblib'))
joblib.dump(ridge_pca,    os.path.join(MODEL_DIR, 'ridge_pca.joblib'))
joblib.dump(ridge_poly,   os.path.join(MODEL_DIR, 'ridge_poly.joblib'))
joblib.dump(pca,          os.path.join(MODEL_DIR, 'pca_transformer.joblib'))
joblib.dump(poly,         os.path.join(MODEL_DIR, 'poly_transformer.joblib'))
joblib.dump(feature_names,os.path.join(MODEL_DIR, 'feature_names.joblib'))
joblib.dump({'data_train': data_train, 'data_test': data_test,
             'target_train': target_train, 'target_test': target_test,
             'data_train_pca': data_train_pca, 'data_test_pca': data_test_pca,
             'data_train_tsne': data_train_tsne}, os.path.join(MODEL_DIR, 'splits.joblib'))
print("All models saved successfully.")