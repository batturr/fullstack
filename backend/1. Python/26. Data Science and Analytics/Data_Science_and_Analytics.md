
# Python Data Science and Analytics (Topic 26)

Data science in Python centers on **NumPy**, **pandas**, visualization (**Matplotlib**, **Seaborn**, **Plotly**), **statistics** (SciPy/statsmodels), **machine learning** (scikit-learn), and efficient **IO** (CSV, SQL, Parquet, HDF5). Each subsection below follows beginner → intermediate → expert depth with runnable-style snippets aimed at analytics pipelines, ML feature work, and executive dashboards.

## 📑 Table of Contents

- [26.1 NumPy Fundamentals](#261-numpy-fundamentals)
- [26.2 NumPy Operations](#262-numpy-operations)
- [26.3 NumPy Advanced Topics](#263-numpy-advanced-topics)
- [26.4 Pandas Fundamentals](#264-pandas-fundamentals)
- [26.5 Data Cleaning](#265-data-cleaning)
- [26.6 Data Transformation](#266-data-transformation)
- [26.7 Matplotlib Visualization](#267-matplotlib-visualization)
- [26.8 Advanced Visualization](#268-advanced-visualization)
- [26.9 Statistics and Inference](#269-statistics-and-inference)
- [26.10 Machine Learning Basics](#2610-machine-learning-basics)
- [26.11 Data IO](#2611-data-io)
- [Topic Key Points](#topic-key-points)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---


## 26.1 NumPy Fundamentals

<a id="261-numpy-fundamentals"></a>


### 26.1.1 NumPy `ndarray` Concept and Vectorization

**Beginner Level**: Numpy `ndarray` concept and vectorization is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain numpy `ndarray` concept and vectorization inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine numpy `ndarray` concept and vectorization with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
a = np.array([1, 2, 3])
print(a.shape, a.dtype)
```

#### Key Points

- Homogeneous dtype enables C-speed loops.
- Avoid Python for-loops over huge arrays.

---


### 26.1.2 Array Creation (`zeros`, `ones`, `arange`, `linspace`)

**Beginner Level**: Array creation (`zeros`, `ones`, `arange`, `linspace`) is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain array creation (`zeros`, `ones`, `arange`, `linspace`) inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine array creation (`zeros`, `ones`, `arange`, `linspace`) with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
print(np.zeros((2, 3)).shape)
print(np.linspace(0, 1, 5))
```

#### Key Points

- `linspace` safer than `arange` with floats.
- Preallocate when building numerical algorithms.

---


### 26.1.3 Shapes, `reshape`, and `-1` Inference

**Beginner Level**: Shapes, `reshape`, and `-1` inference is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain shapes, `reshape`, and `-1` inference inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine shapes, `reshape`, and `-1` inference with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
a = np.arange(12).reshape(3, -1)
print(a.shape)
```

#### Key Points

- Total elements must match when reshaping.
- Reshape does not change values, only view.

---


### 26.1.4 Indexing, Slicing, and Fancy Indexing

**Beginner Level**: Indexing, slicing, and fancy indexing is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain indexing, slicing, and fancy indexing inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine indexing, slicing, and fancy indexing with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
a = np.arange(10)
print(a[2:8:2], a[[1, 3, 3]])
```

#### Key Points

- Boolean masks filter by predicate.
- Fancy indexing often copies—mind memory.

---


### 26.1.5 Views vs Copies and Safe Mutation

**Beginner Level**: Views vs copies and safe mutation is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain views vs copies and safe mutation inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine views vs copies and safe mutation with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
a = np.arange(4)
v = a[1:3]
v[:] = 99
print(a)
c = a[1:3].copy()
```

#### Key Points

- Mutating views affects parent.
- When unsure, `.copy()` before writes.

---


### 26.1.6 Dtypes, Casting, and Memory Footprint

**Beginner Level**: Dtypes, casting, and memory footprint is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain dtypes, casting, and memory footprint inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine dtypes, casting, and memory footprint with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
a = np.array([1, 2, 3], dtype=np.int32)
print(a.astype(np.float64).dtype)
```

#### Key Points

- Downcast wide int/float columns in big tables.
- Watch overflow when narrowing dtypes.

---


### 26.1.7 Structured Arrays (Lightweight Tables)

**Beginner Level**: Structured arrays (lightweight tables) is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain structured arrays (lightweight tables) inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine structured arrays (lightweight tables) with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
dt = [('id', 'i4'), ('score', 'f4')]
rec = np.array([(1, 9.0)], dtype=dt)
print(rec['score'])
```

#### Key Points

- Useful for compact binary columns.
- pandas is richer for mixed analytics.

---


### 26.1.8 Constants and `np.newaxis` for Broadcasting Prep

**Beginner Level**: Constants and `np.newaxis` for broadcasting prep is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain constants and `np.newaxis` for broadcasting prep inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine constants and `np.newaxis` for broadcasting prep with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
x = np.array([1, 2, 3])[:, np.newaxis]
y = np.array([10, 20, 30])[np.newaxis, :]
print((x + y).shape)
```

#### Key Points

- Insert axes to align shapes deliberately.
- Broadcasting avoids explicit tile in many cases.

---


## 26.2 NumPy Operations

<a id="262-numpy-operations"></a>


### 26.2.1 Element-wise Arithmetic and Ufuncs

**Beginner Level**: Element-wise arithmetic and ufuncs is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain element-wise arithmetic and ufuncs inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine element-wise arithmetic and ufuncs with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
a = np.array([1, 2, 3])
print(a + 10, np.sqrt(a.astype(float)))
```

#### Key Points

- Ufuncs dispatch to optimized loops.
- Mixing dtypes promotes to wider dtype.

---


### 26.2.2 Comparisons and Boolean Masks

**Beginner Level**: Comparisons and boolean masks is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain comparisons and boolean masks inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine comparisons and boolean masks with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
x = np.array([1, 2, 3, 4])
print(x[x > 2])
```

#### Key Points

- Combine masks with `&` `|` and parentheses.
- Use `np.where` for vectorized if/else.

---


### 26.2.3 Logical `logical_and` / `logical_or`

**Beginner Level**: Logical `logical_and` / `logical_or` is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain logical `logical_and` / `logical_or` inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine logical `logical_and` / `logical_or` with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
m1 = np.array([True, False])
m2 = np.array([True, True])
print(np.logical_and(m1, m2))
```

#### Key Points

- Python `and` does not broadcast.
- Reduce with `np.all` / `np.any` carefully on axes.

---


### 26.2.4 Broadcasting Rules in Practice

**Beginner Level**: Broadcasting rules in practice is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain broadcasting rules in practice inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine broadcasting rules in practice with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
a = np.arange(3).reshape(3, 1)
b = np.arange(3).reshape(1, 3)
print(a + b)
```

#### Key Points

- Align trailing dimensions.
- Size-1 dimensions stretch virtually.

---


### 26.2.5 Matrix Multiplication `@` vs Element-wise `*`

**Beginner Level**: Matrix multiplication `@` vs element-wise `*` is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain matrix multiplication `@` vs element-wise `*` inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine matrix multiplication `@` vs element-wise `*` with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
A = np.random.randn(2, 3)
B = np.random.randn(3, 4)
print((A @ B).shape)
```

#### Key Points

- `@` is matmul in Python 3.5+.
- Do not confuse with element-wise multiply.

---


### 26.2.6 Linear Algebra (`linalg`) Essentials

**Beginner Level**: Linear algebra (`linalg`) essentials is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain linear algebra (`linalg`) essentials inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine linear algebra (`linalg`) essentials with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
A = np.array([[2.0, 0], [0, 3]])
print(np.linalg.eigvals(A))
```

#### Key Points

- `lstsq` solves least squares.
- Condition number warns about instability.

---


### 26.2.7 NaN Policies and `nanmean`

**Beginner Level**: Nan policies and `nanmean` is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain nan policies and `nanmean` inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine nan policies and `nanmean` with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
x = np.array([1.0, np.nan, 3.0])
print(np.nanmean(x))
```

#### Key Points

- Decide impute vs drop policy upstream.
- NaNs propagate through reductions unless using nan*.

---


### 26.2.8 Stacking and Splitting Arrays

**Beginner Level**: Stacking and splitting arrays is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain stacking and splitting arrays inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine stacking and splitting arrays with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
a = np.array([[1, 2]])
b = np.array([[3, 4]])
print(np.vstack([a, b]))
```

#### Key Points

- `concatenate` generalizes axis choice.
- Splitting mirrors batching in neural nets.

---


### 26.2.9 `einsum` for Readable Tensor Contractions

**Beginner Level**: `einsum` for readable tensor contractions is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain `einsum` for readable tensor contractions inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine `einsum` for readable tensor contractions with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
A = np.random.randn(3, 4)
B = np.random.randn(4, 5)
C = np.einsum('ij,jk->ik', A, B)
print(np.allclose(C, A @ B))
```

#### Key Points

- Powerful for batched operations.
- Typos in subscripts are subtle bugs.

---


## 26.3 NumPy Advanced Topics

<a id="263-numpy-advanced-topics"></a>


### 26.3.1 Sorting, `argsort`, and `searchsorted`

**Beginner Level**: Sorting, `argsort`, and `searchsorted` is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain sorting, `argsort`, and `searchsorted` inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine sorting, `argsort`, and `searchsorted` with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
x = np.array([3, 1, 2])
print(np.argsort(x))
print(np.searchsorted(np.sort(x), 2))
```

#### Key Points

- Argsort drives ranking features.
- Binary search needs sorted baseline.

---


### 26.3.2 Statistical Reductions (`mean`, `var`, percentiles)

**Beginner Level**: Statistical reductions (`mean`, `var`, percentiles) is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain statistical reductions (`mean`, `var`, percentiles) inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine statistical reductions (`mean`, `var`, percentiles) with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
x = np.random.randn(1000)
print(np.percentile(x, [5, 50, 95]))
```

#### Key Points

- Use axis arguments for 2D tables.
- Prefer robust stats if heavy tails.

---


### 26.3.3 Random `Generator` API and Reproducibility

**Beginner Level**: Random `generator` api and reproducibility is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain random `generator` api and reproducibility inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine random `generator` api and reproducibility with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
rng = np.random.default_rng(42)
print(rng.normal(size=3))
```

#### Key Points

- Seed per experiment notebook.
- Independent streams per parallel worker.

---


### 26.3.4 Saving `.npy` and Bundling `.npz`

**Beginner Level**: Saving `.npy` and bundling `.npz` is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain saving `.npy` and bundling `.npz` inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine saving `.npy` and bundling `.npz` with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
a = np.arange(9).reshape(3, 3)
np.savez('b.npz', a=a, b=a+1)
d = np.load('b.npz')
print(d['b'].shape)
```

#### Key Points

- `.npy` is simple tensor interchange.
- Zip bundles multiple arrays atomically.

---


### 26.3.5 Memory Order: C vs Fortran Contiguity

**Beginner Level**: Memory order: c vs fortran contiguity is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain memory order: c vs fortran contiguity inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine memory order: c vs fortran contiguity with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
a = np.arange(12).reshape(3, 4)
print(a.flags.c_contiguous, np.asfortranarray(a).flags.f_contiguous)
```

#### Key Points

- LAPACK/BLAS may prefer F-order.
- Copies happen when order mismatches.

---


### 26.3.6 Broadcasting Temporary Arrays and `out=`

**Beginner Level**: Broadcasting temporary arrays and `out=` is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain broadcasting temporary arrays and `out=` inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine broadcasting temporary arrays and `out=` with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
x = np.random.randn(1_000_000)
np.multiply(x, 2.0, out=x)
print(x[:3])
```

#### Key Points

- Long ufunc chains allocate temporaries.
- numexpr helps complex expressions.

---


### 26.3.7 Masked Arrays for Sentinel Values

**Beginner Level**: Masked arrays for sentinel values is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain masked arrays for sentinel values inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine masked arrays for sentinel values with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
x = np.array([1, -999, 3])
m = np.ma.masked_where(x == -999, x)
print(float(m.mean()))
```

#### Key Points

- Good for scientific sentinels.
- pandas nullable dtypes often clearer in analytics.

---


### 26.3.8 Memory-Mapped Arrays (`memmap`) for Huge Files

**Beginner Level**: Memory-mapped arrays (`memmap`) for huge files is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain memory-mapped arrays (`memmap`) for huge files inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine memory-mapped arrays (`memmap`) for huge files with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
# mm = np.memmap('big.dat', dtype='float32', mode='r', shape=(10**6,))
print('map huge arrays without full RAM load')
```

#### Key Points

- Great for read-mostly scientific tensors.
- Mind alignment and flush on writable maps.

---


## 26.4 Pandas Fundamentals

<a id="264-pandas-fundamentals"></a>


### 26.4.1 pandas `Series` and Index Alignment

**Beginner Level**: Pandas `series` and index alignment is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain pandas `series` and index alignment inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine pandas `series` and index alignment with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
s = pd.Series([10, 20], index=['a', 'b'])
print(s.loc['b'])
```

#### Key Points

- Alignment drives merges and arithmetic.
- Name series for readable DataFrames.

---


### 26.4.2 pandas `DataFrame` as Columnar Table

**Beginner Level**: Pandas `dataframe` as columnar table is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain pandas `dataframe` as columnar table inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine pandas `dataframe` as columnar table with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
df = pd.DataFrame({'sku': ['A'], 'qty': [1]})
print(df.dtypes)
```

#### Key Points

- Each column is a Series.
- `info()`/`describe()` start EDA.

---


### 26.4.3 Constructing DataFrames (dict, records, CSV)

**Beginner Level**: Constructing dataframes (dict, records, csv) is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain constructing dataframes (dict, records, csv) inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine constructing dataframes (dict, records, csv) with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
print(pd.DataFrame.from_records([{'x': 1}, {'x': 2}]))
```

#### Key Points

- Set dtypes at ingest to save RAM.
- Parse dates early for time indexes.

---


### 26.4.4 `loc`, `iloc`, and Boolean Selection

**Beginner Level**: `loc`, `iloc`, and boolean selection is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain `loc`, `iloc`, and boolean selection inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine `loc`, `iloc`, and boolean selection with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
df = pd.DataFrame({'a': [1, 2], 'b': [3, 4]})
print(df.loc[df['a'] > 1, ['b']])
```

#### Key Points

- Avoid chained assignment.
- `iloc` is positional only.

---


### 26.4.5 Selection Idioms for Reporting

**Beginner Level**: Selection idioms for reporting is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain selection idioms for reporting inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine selection idioms for reporting with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
df = pd.DataFrame({'region': ['EU', 'US'], 'rev': [100, 200]})
print(df.sort_values('rev', ascending=False).head(1))
```

#### Key Points

- Method chaining readable with line breaks.
- Reset index after filters if needed.

---


### 26.4.6 Dtypes, Nullable Integers, Categoricals

**Beginner Level**: Dtypes, nullable integers, categoricals is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain dtypes, nullable integers, categoricals inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine dtypes, nullable integers, categoricals with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
s = pd.Series([1, None, 3], dtype='Int64')
print(s)
```

#### Key Points

- Nullable ints distinguish missing cleanly.
- Categorical reduces memory for repeated strings.

---


### 26.4.7 `MultiIndex` for Hierarchical Data

**Beginner Level**: `multiindex` for hierarchical data is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain `multiindex` for hierarchical data inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine `multiindex` for hierarchical data with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
idx = pd.MultiIndex.from_product([['2024', '2025'], ['Q1', 'Q2']])
s = pd.Series(range(4), index=idx)
print(s.loc['2024'])
```

#### Key Points

- Panel data naturally nested.
- `stack`/`unstack` reshape wide/long.

---


### 26.4.8 Vectorization vs `apply` Performance

**Beginner Level**: Vectorization vs `apply` performance is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain vectorization vs `apply` performance inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine vectorization vs `apply` performance with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
df = pd.DataFrame({'x': [1, 2, 3]})
print(df['x'] * 2)
```

#### Key Points

- Built-in ops are Cythonized.
- Python `apply` row loops are slower.

---


## 26.5 Data Cleaning

<a id="265-data-cleaning"></a>


### 26.5.1 Missing Data: `isna`, `fillna`, `dropna`

**Beginner Level**: Missing data: `isna`, `fillna`, `dropna` is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain missing data: `isna`, `fillna`, `dropna` inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine missing data: `isna`, `fillna`, `dropna` with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
import numpy as np
s = pd.Series([1, np.nan, 3])
print(s.fillna(0))
```

#### Key Points

- Document MCAR/MAR/MNAR assumptions.
- Imputation affects model bias.

---


### 26.5.2 Duplicate Detection and `drop_duplicates`

**Beginner Level**: Duplicate detection and `drop_duplicates` is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain duplicate detection and `drop_duplicates` inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine duplicate detection and `drop_duplicates` with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
df = pd.DataFrame({'id': [1, 1], 'v': [10, 10]})
print(df.drop_duplicates())
```

#### Key Points

- Keep latest by timestamp when deduping events.
- Assert unique keys before joins.

---


### 26.5.3 Type Conversion: `astype`, `to_numeric`

**Beginner Level**: Type conversion: `astype`, `to_numeric` is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain type conversion: `astype`, `to_numeric` inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine type conversion: `astype`, `to_numeric` with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
s = pd.Series(['1', '2', 'x'])
print(pd.to_numeric(s, errors='coerce'))
```

#### Key Points

- Coerce then count invalids.
- Use `category` for low-cardinality text.

---


### 26.5.4 String Cleaning with `.str` Accessors

**Beginner Level**: String cleaning with `.str` accessors is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain string cleaning with `.str` accessors inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine string cleaning with `.str` accessors with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
s = pd.Series(['  ada ', 'BOB'])
print(s.str.strip().str.title())
```

#### Key Points

- Vectorized string ops beat apply.
- Regex extract for log parsing.

---


### 26.5.5 Validation Rules and Quarantines

**Beginner Level**: Validation rules and quarantines is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain validation rules and quarantines inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine validation rules and quarantines with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
df = pd.DataFrame({'age': [10, 200]})
print(df.loc[~df['age'].between(0, 120)])
```

#### Key Points

- Great Expectations/pandera for contracts.
- Fail batches to DLQ with reasons.

---


### 26.5.6 Outliers: Robust Z-score and IQR Sketches

**Beginner Level**: Outliers: robust z-score and iqr sketches is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain outliers: robust z-score and iqr sketches inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine outliers: robust z-score and iqr sketches with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
import numpy as np
x = pd.Series(np.random.randn(1000))
print(x.quantile([0.25, 0.5, 0.75]))
```

#### Key Points

- Domain knowledge first.
- Winsorize vs drop based on sample size.

---


### 26.5.7 Regex Extraction for Semi-Structured Text

**Beginner Level**: Regex extraction for semi-structured text is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain regex extraction for semi-structured text inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine regex extraction for semi-structured text with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
s = pd.Series(['id=7', 'id=42'])
print(s.str.extract(r'id=(\d+)'))
```

#### Key Points

- Test regex on edge cases.
- Anchor patterns to reduce false positives.

---


### 26.5.8 Categorical Encoding Considerations

**Beginner Level**: Categorical encoding considerations is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain categorical encoding considerations inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine categorical encoding considerations with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
df = pd.DataFrame({'city': ['NYC', 'NYC', 'LA']})
df['city'] = df['city'].astype('category')
print(df['city'].cat.categories)
```

#### Key Points

- Tree models handle low-cardinality cats well.
- One-hot for linear models when needed.

---


## 26.6 Data Transformation

<a id="266-data-transformation"></a>


### 26.6.1 Filtering with Booleans and `query`

**Beginner Level**: Filtering with booleans and `query` is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain filtering with booleans and `query` inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine filtering with booleans and `query` with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
df = pd.DataFrame({'qty': [1, 5]})
print(df.query('qty > 2'))
```

#### Key Points

- Sanitize external query strings.
- Boolean masks are explicit and safe.

---


### 26.6.2 Sorting for Dashboards and Exports

**Beginner Level**: Sorting for dashboards and exports is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain sorting for dashboards and exports inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine sorting for dashboards and exports with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
df = pd.DataFrame({'k': ['b', 'a'], 'v': [2, 1]})
print(df.sort_values(['k', 'v']))
```

#### Key Points

- Stable sort preserves ties order.
- Match business sort defaults.

---


### 26.6.3 `groupby` Aggregations

**Beginner Level**: `groupby` aggregations is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain `groupby` aggregations inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine `groupby` aggregations with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
df = pd.DataFrame({'g': ['a', 'a'], 'x': [1, 2]})
print(df.groupby('g')['x'].sum())
```

#### Key Points

- Use `agg` for multiple metrics.
- AsIndex=False for SQL-like frames.

---


### 26.6.4 Named Aggregations

**Beginner Level**: Named aggregations is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain named aggregations inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine named aggregations with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
df = pd.DataFrame({'g': ['a', 'b'], 'x': [1, 3]})
print(df.groupby('g').agg(mean_x=('x', 'mean')))
```

#### Key Points

- Clarifies output schema.
- Prefer named over anonymous lambdas.

---


### 26.6.5 Pivot Tables for Spreadsheet Summaries

**Beginner Level**: Pivot tables for spreadsheet summaries is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain pivot tables for spreadsheet summaries inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine pivot tables for spreadsheet summaries with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
df = pd.DataFrame({'d': ['M', 'T'], 'sku': ['A', 'A'], 'qty': [1, 2]})
print(df.pivot_table(index='d', columns='sku', values='qty', aggfunc='sum', fill_value=0))
```

#### Key Points

- Mind sparse memory.
- Great for executive tables.

---


### 26.6.6 Merging and Join Types

**Beginner Level**: Merging and join types is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain merging and join types inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine merging and join types with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
left = pd.DataFrame({'id': [1, 2], 'v': [10, 20]})
right = pd.DataFrame({'id': [2, 3], 'w': [1, 2]})
print(left.merge(right, on='id', how='outer', indicator=True))
```

#### Key Points

- Use `_merge` to audit row counts.
- Avoid many-to-many explosions.

---


### 26.6.7 Concatenation Along Rows/Columns

**Beginner Level**: Concatenation along rows/columns is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain concatenation along rows/columns inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine concatenation along rows/columns with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
a = pd.DataFrame({'x': [1]})
b = pd.DataFrame({'x': [2]})
print(pd.concat([a, b], ignore_index=True))
```

#### Key Points

- Align columns with join options.
- Keys create hierarchical index.

---


### 26.6.8 Rolling and Expanding Windows

**Beginner Level**: Rolling and expanding windows is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain rolling and expanding windows inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine rolling and expanding windows with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
s = pd.Series(range(5))
print(s.rolling(3).mean())
```

#### Key Points

- Use for moving averages in KPI charts.
- Set `min_periods` for partial windows.

---


### 26.6.9 Resampling Time Series

**Beginner Level**: Resampling time series is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain resampling time series inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine resampling time series with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
idx = pd.date_range('2024-01-01', periods=48, freq='h')
s = pd.Series(range(48), index=idx)
print(s.resample('D').sum().head())
```

#### Key Points

- Choose label/closed for business calendars.
- Timezones must be explicit.

---


## 26.7 Matplotlib Visualization

<a id="267-matplotlib-visualization"></a>


### 26.7.1 Figures, Axes, and the OO API

**Beginner Level**: Figures, axes, and the oo api is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain figures, axes, and the oo api inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine figures, axes, and the oo api with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.set_title('KPI')
plt.close(fig)
```

#### Key Points

- Prefer `ax.*` over implicit state.
- Close figures in batch jobs.

---


### 26.7.2 Line Plots for Time Series Metrics

**Beginner Level**: Line plots for time series metrics is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain line plots for time series metrics inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine line plots for time series metrics with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import matplotlib.pyplot as plt
import pandas as pd
idx = pd.date_range('2024-01-01', periods=10, freq='D')
s = pd.Series(range(10), index=idx)
fig, ax = plt.subplots()
s.plot(ax=ax)
plt.close(fig)
```

#### Key Points

- Rotate tick labels for readability.
- Mark incidents/launches with vlines.

---


### 26.7.3 Scatter Plots for Correlation Checks

**Beginner Level**: Scatter plots for correlation checks is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain scatter plots for correlation checks inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine scatter plots for correlation checks with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.scatter([1, 2, 3], [2, 2, 1], alpha=0.7)
plt.close(fig)
```

#### Key Points

- Use alpha for dense clouds.
- Hue third dimension carefully.

---


### 26.7.4 Bar Charts for Categorical Comparisons

**Beginner Level**: Bar charts for categorical comparisons is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain bar charts for categorical comparisons inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine bar charts for categorical comparisons with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.bar(['A', 'B'], [3, 7])
plt.close(fig)
```

#### Key Points

- Sort bars when order not intrinsic.
- Label values for slides.

---


### 26.7.5 Histograms and Density

**Beginner Level**: Histograms and density is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain histograms and density inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine histograms and density with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import matplotlib.pyplot as plt
import numpy as np
fig, ax = plt.subplots()
ax.hist(np.random.randn(1000), bins=30)
plt.close(fig)
```

#### Key Points

- Bin count changes story.
- Overlay KDE for smooth view.

---


### 26.7.6 Box Plots for Distributions by Group

**Beginner Level**: Box plots for distributions by group is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain box plots for distributions by group inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine box plots for distributions by group with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import matplotlib.pyplot as plt
import numpy as np
fig, ax = plt.subplots()
ax.boxplot([np.random.randn(50), np.random.randn(50)+1], labels=['A', 'B'])
plt.close(fig)
```

#### Key Points

- Explain quartiles to stakeholders.
- Add jittered points for small n.

---


### 26.7.7 Subplots, Grids, and Layout

**Beginner Level**: Subplots, grids, and layout is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain subplots, grids, and layout inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine subplots, grids, and layout with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import matplotlib.pyplot as plt
fig, axes = plt.subplots(2, 2, figsize=(7, 5))
for ax in axes.ravel():
    ax.plot([0, 1], [0, 1])
fig.tight_layout()
plt.close(fig)
```

#### Key Points

- Share axes for comparisons.
- Use `constrained_layout` to reduce overlap.

---


### 26.7.8 Legends, Labels, and Accessible Palettes

**Beginner Level**: Legends, labels, and accessible palettes is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain legends, labels, and accessible palettes inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine legends, labels, and accessible palettes with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.plot([0, 1], [0, 1], label='m')
ax.legend()
ax.set_xlabel('days')
plt.close(fig)
```

#### Key Points

- Colorblind-safe palettes build trust.
- State units in axis labels.

---


### 26.7.9 Exporting Figures (`savefig`)

**Beginner Level**: Exporting figures (`savefig`) is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain exporting figures (`savefig`) inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine exporting figures (`savefig`) with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.plot([0, 1], [1, 0])
fig.savefig('out.png', dpi=200, bbox_inches='tight')
plt.close(fig)
```

#### Key Points

- Pick dpi for medium (web vs print).
- Embed fonts for brand consistency.

---


## 26.8 Advanced Visualization

<a id="268-advanced-visualization"></a>


### 26.8.1 Seaborn Themes and Statistical Aesthetics

**Beginner Level**: Seaborn themes and statistical aesthetics is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain seaborn themes and statistical aesthetics inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine seaborn themes and statistical aesthetics with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import seaborn as sns
sns.set_theme(style='whitegrid')
```

#### Key Points

- Seaborn builds on Matplotlib.
- Context `talk`/`paper` adjusts font sizes.

---


### 26.8.2 `relplot` for Relationships with Facets

**Beginner Level**: `relplot` for relationships with facets is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain `relplot` for relationships with facets inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine `relplot` for relationships with facets with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import seaborn as sns
import pandas as pd
df = pd.DataFrame({'x': [1, 2], 'y': [2, 1], 'g': ['a', 'b']})
g = sns.relplot(data=df, x='x', y='y', hue='g')
plt = __import__('matplotlib.pyplot')
plt.close(g.figure)
```

#### Key Points

- Facet small multiples for cohorts.
- Control point size/alpha for density.

---


### 26.8.3 Heatmaps of Correlations

**Beginner Level**: Heatmaps of correlations is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain heatmaps of correlations inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine heatmaps of correlations with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import seaborn as sns
import pandas as pd
import numpy as np
df = pd.DataFrame(np.random.randn(50, 4), columns=list('ABCD'))
ax = sns.heatmap(df.corr(), center=0, cmap='vlag')
plt = __import__('matplotlib.pyplot')
plt.close(ax.figure)
```

#### Key Points

- Annotate sparingly on large matrices.
- Cluster rows/cols for structure.

---


### 26.8.4 Distribution Plots (`histplot`, `kdeplot`)

**Beginner Level**: Distribution plots (`histplot`, `kdeplot`) is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain distribution plots (`histplot`, `kdeplot`) inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine distribution plots (`histplot`, `kdeplot`) with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import seaborn as sns
import numpy as np
import matplotlib.pyplot as plt
x = np.random.gamma(2, size=300)
ax = sns.histplot(x, kde=True)
plt.close(ax.figure)
```

#### Key Points

- Compare train vs serve distributions.
- Log-scale revenue tails when needed.

---


### 26.8.5 Categorical Plots (`barplot`, `boxplot`)

**Beginner Level**: Categorical plots (`barplot`, `boxplot`) is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain categorical plots (`barplot`, `boxplot`) inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine categorical plots (`barplot`, `boxplot`) with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import seaborn as sns
import pandas as pd
import matplotlib.pyplot as plt
df = pd.DataFrame({'d': ['Mon', 'Tue'], 's': [10, 12]})
ax = sns.barplot(data=df, x='d', y='s')
plt.close(ax.figure)
```

#### Key Points

- Show uncertainty when estimator supports it.
- Order categories meaningfully.

---


### 26.8.6 `FacetGrid` Dashboard Tiles

**Beginner Level**: `facetgrid` dashboard tiles is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain `facetgrid` dashboard tiles inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine `facetgrid` dashboard tiles with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import seaborn as sns
import pandas as pd
import matplotlib.pyplot as plt
df = pd.DataFrame({'x': [1, 2], 'y': [2, 1], 'r': ['EU', 'US']})
g = sns.FacetGrid(df, col='r')
g.map(sns.scatterplot, 'x', 'y')
plt.close(g.figure)
```

#### Key Points

- Keep grid readable—avoid too many facets.
- Share axes when scales comparable.

---


### 26.8.7 Plotly Express Interactive Charts

**Beginner Level**: Plotly express interactive charts is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain plotly express interactive charts inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine plotly express interactive charts with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import plotly.express as px
df = px.data.iris()
fig = px.scatter(df, x='sepal_width', y='sepal_length', color='species')
print(len(fig.data))
```

#### Key Points

- HTML export for analyst sharing.
- Downsample points for browser performance.

---


### 26.8.8 Dash Dashboards (Architecture Notes)

**Beginner Level**: Dash dashboards (architecture notes) is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain dash dashboards (architecture notes) inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine dash dashboards (architecture notes) with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
NOTE = 'Separate data queries from layout; cache with TTL'
print(NOTE)
```

#### Key Points

- AuthN/Z dashboards exposing sensitive metrics.
- Rate-limit callbacks hitting warehouses.

---


### 26.8.9 Storytelling: Titles, Captions, and Data Freshness

**Beginner Level**: Storytelling: titles, captions, and data freshness is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain storytelling: titles, captions, and data freshness inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine storytelling: titles, captions, and data freshness with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
CAP = 'State as-of timestamp and filters on every exported chart'
print(CAP)
```

#### Key Points

- Executives need timeframe context.
- Avoid dual y-axes distortion when possible.

---


## 26.9 Statistics and Inference

<a id="269-statistics-and-inference"></a>


### 26.9.1 Descriptive Moments and Summaries

**Beginner Level**: Descriptive moments and summaries is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain descriptive moments and summaries inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine descriptive moments and summaries with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
import numpy as np
s = pd.Series(np.random.randn(300))
print(s.mean(), s.std(), s.skew())
```

#### Key Points

- Report units and sample size.
- Skew guides transform choice.

---


### 26.9.2 SciPy Distributions and `ppf`/`cdf`

**Beginner Level**: Scipy distributions and `ppf`/`cdf` is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain scipy distributions and `ppf`/`cdf` inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine scipy distributions and `ppf`/`cdf` with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
from scipy import stats
dist = stats.norm(0, 1)
print(dist.ppf(0.975))
```

#### Key Points

- Pick distribution matching generative story.
- Small samples make fits unstable.

---


### 26.9.3 Hypothesis Tests (t-test Sketch)

**Beginner Level**: Hypothesis tests (t-test sketch) is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain hypothesis tests (t-test sketch) inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine hypothesis tests (t-test sketch) with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
from scipy import stats
import numpy as np
a = np.random.normal(0, 1, 40)
b = np.random.normal(0.4, 1, 40)
print(stats.ttest_ind(a, b).pvalue)
```

#### Key Points

- Check independence assumptions.
- Correct for multiple comparisons.

---


### 26.9.4 Pearson vs Spearman Correlation

**Beginner Level**: Pearson vs spearman correlation is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain pearson vs spearman correlation inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine pearson vs spearman correlation with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
df = pd.DataFrame({'x': [1, 2, 3], 'y': [3, 2, 1]})
print(df['x'].corr(df['y'], method='spearman'))
```

#### Key Points

- Spearman robust to monotonic nonlinearities.
- Correlation not causation.

---


### 26.9.5 Linear Regression as Baseline

**Beginner Level**: Linear regression as baseline is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain linear regression as baseline inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine linear regression as baseline with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import numpy as np
from sklearn.linear_model import LinearRegression
X = np.array([[1], [2], [3]])
y = np.array([1.0, 2.2, 2.9])
m = LinearRegression().fit(X, y)
print(m.coef_, m.intercept_)
```

#### Key Points

- Interpret coefficients with scaling.
- Inspect residuals.

---


### 26.9.6 Seasonal Decomposition (Conceptual)

**Beginner Level**: Seasonal decomposition (conceptual) is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain seasonal decomposition (conceptual) inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine seasonal decomposition (conceptual) with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
from statsmodels.tsa.seasonal import seasonal_decompose
idx = pd.date_range('2020-01-01', periods=120, freq='M')
s = pd.Series(range(120), index=idx, dtype=float)
res = seasonal_decompose(s, model='additive', period=12)
print(type(res))
```

#### Key Points

- Choose additive vs multiplicative seasonality.
- Hold out tail for validation.

---


### 26.9.7 Differencing for Stationarity (Light)

**Beginner Level**: Differencing for stationarity (light) is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain differencing for stationarity (light) inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine differencing for stationarity (light) with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
s = pd.Series([1, 2, 4, 7, 11], dtype=float)
print(s.diff().dropna())
```

#### Key Points

- ADF tests formalize unit roots.
- ARIMA pipelines need careful orders.

---


### 26.9.8 Forecast Baselines: Naive and Seasonal Naive

**Beginner Level**: Forecast baselines: naive and seasonal naive is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain forecast baselines: naive and seasonal naive inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine forecast baselines: naive and seasonal naive with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
s = pd.Series(range(24), index=pd.date_range('2024-01-01', periods=24, freq='M'), dtype=float)
print(s.shift(1).iloc[-1], s.shift(12).iloc[-1])
```

#### Key Points

- Beat baselines before complex models.
- Translate error metrics to money.

---


## 26.10 Machine Learning Basics

<a id="2610-machine-learning-basics"></a>


### 26.10.1 scikit-learn Estimator Protocol

**Beginner Level**: Scikit-learn estimator protocol is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain scikit-learn estimator protocol inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine scikit-learn estimator protocol with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
X, y = make_classification(random_state=0)
m = LogisticRegression(max_iter=200).fit(X, y)
print(m.score(X, y))
```

#### Key Points

- `fit` learns; `predict` infers.
- Pipelines chain steps safely.

---


### 26.10.2 Train/Test Splits and Stratification

**Beginner Level**: Train/test splits and stratification is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain train/test splits and stratification inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine train/test splits and stratification with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
from sklearn.model_selection import train_test_split
from sklearn.datasets import make_classification
X, y = make_classification(random_state=0)
Xt, Xv, yt, yv = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)
print(Xt.shape, Xv.shape)
```

#### Key Points

- Stratify imbalanced labels.
- Lock seeds in experiments.

---


### 26.10.3 Classification Metrics and Reports

**Beginner Level**: Classification metrics and reports is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain classification metrics and reports inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine classification metrics and reports with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
from sklearn.metrics import classification_report
print(classification_report([0,1,1],[0,1,0], zero_division=0))
```

#### Key Points

- Precision/recall trade-offs in fraud.
- PR-AUC when prevalence tiny.

---


### 26.10.4 Regression Metrics (MAE/RMSE)

**Beginner Level**: Regression metrics (mae/rmse) is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain regression metrics (mae/rmse) inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine regression metrics (mae/rmse) with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
from sklearn.metrics import mean_absolute_error, mean_squared_error
print(mean_absolute_error([1.0, 2.0], [1.1, 1.8]))
```

#### Key Points

- Report metrics in business units.
- RMSE punishes large errors.

---


### 26.10.5 Unsupervised k-means Clustering

**Beginner Level**: Unsupervised k-means clustering is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain unsupervised k-means clustering inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine unsupervised k-means clustering with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs
X, _ = make_blobs(n_samples=200, centers=3, random_state=0)
km = KMeans(n_clusters=3, n_init='auto', random_state=0).fit(X)
print(km.inertia_)
```

#### Key Points

- Scale features for distance metrics.
- Interpret clusters with domain labels.

---


### 26.10.6 k-fold Cross-Validation

**Beginner Level**: K-fold cross-validation is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain k-fold cross-validation inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine k-fold cross-validation with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import Ridge
from sklearn.datasets import make_regression
X, y = make_regression(n_samples=200, random_state=0)
print(cross_val_score(Ridge(), X, y, cv=5).mean())
```

#### Key Points

- Use StratifiedKFold for classification.
- Nested CV reduces selection bias.

---


### 26.10.7 Hyperparameter Search (`GridSearchCV`)

**Beginner Level**: Hyperparameter search (`gridsearchcv`) is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain hyperparameter search (`gridsearchcv`) inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine hyperparameter search (`gridsearchcv`) with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
from sklearn.model_selection import GridSearchCV
from sklearn.svm import SVC
from sklearn.datasets import make_classification
X, y = make_classification(random_state=0)
g = GridSearchCV(SVC(), {'C':[0.1,1]}, cv=3)
g.fit(X, y)
print(g.best_params_)
```

#### Key Points

- RandomizedSearch for large spaces.
- Track experiments (MLflow).

---


### 26.10.8 Feature Scaling in Pipelines

**Beginner Level**: Feature scaling in pipelines is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain feature scaling in pipelines inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine feature scaling in pipelines with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.neighbors import KNeighborsClassifier
from sklearn.datasets import make_classification
X, y = make_classification(random_state=0)
clf = make_pipeline(StandardScaler(), KNeighborsClassifier())
print(clf.fit(X, y).score(X, y))
```

#### Key Points

- Fit scaler inside CV only.
- Trees often skip scaling.

---


### 26.10.9 Feature Selection with Importances

**Beginner Level**: Feature selection with importances is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain feature selection with importances inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine feature selection with importances with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import SelectFromModel
from sklearn.datasets import make_classification
X, y = make_classification(n_features=20, random_state=0)
rf = RandomForestClassifier(random_state=0).fit(X, y)
sel = SelectFromModel(rf, prefit=True, max_features=5)
print(sel.transform(X).shape)
```

#### Key Points

- Reduces overfitting and latency.
- Re-evaluate after drift.

---


## 26.11 Data IO

<a id="2611-data-io"></a>


### 26.11.1 CSV `read_csv` / `to_csv` Patterns

**Beginner Level**: Csv `read_csv` / `to_csv` patterns is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain csv `read_csv` / `to_csv` patterns inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine csv `read_csv` / `to_csv` patterns with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
# pd.read_csv('big.csv', usecols=['id','amt'], dtype={'id':'int32'})
print('chunking + dtypes')
```

#### Key Points

- Use `chunksize` for RAM-bound ETL.
- Avoid `index=False` mistakes in exports.

---


### 26.11.2 Excel Interchange (`read_excel`)

**Beginner Level**: Excel interchange (`read_excel`) is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain excel interchange (`read_excel`) inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine excel interchange (`read_excel`) with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
# pd.read_excel('f.xlsx', sheet_name='Sales', engine='openpyxl')
print('prefer parquet for pipelines')
```

#### Key Points

- Excel great for humans, brittle for automation.
- Mind hidden sheets and macros.

---


### 26.11.3 JSON Normalization for APIs

**Beginner Level**: Json normalization for apis is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain json normalization for apis inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine json normalization for apis with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
raw = [{'id': 1, 'tags': ['a']}, {'id': 2, 'tags': ['b','c']}]
print(pd.json_normalize(raw, sep='_').columns)
```

#### Key Points

- Explode lists to events.
- Schema versioning for mobile payloads.

---


### 26.11.4 SQL Extraction with pandas (`read_sql`)

**Beginner Level**: Sql extraction with pandas (`read_sql`) is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain sql extraction with pandas (`read_sql`) inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine sql extraction with pandas (`read_sql`) with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
SQL = 'SELECT id, amount FROM orders WHERE day = %(d)s'
print(SQL)
```

#### Key Points

- Always parameterize SQL.
- Push filters to database.

---


### 26.11.5 Parquet with pandas/pyarrow

**Beginner Level**: Parquet with pandas/pyarrow is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain parquet with pandas/pyarrow inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine parquet with pandas/pyarrow with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
import pandas as pd
df = pd.DataFrame({'x': [1, 2, 3]})
df.to_parquet('tmp_ds.parquet', index=False)
print(pd.read_parquet('tmp_ds.parquet').shape)
```

#### Key Points

- Column pruning via `columns=`
- Compatible with Spark/DuckDB.

---


### 26.11.6 HDF5 for Large Tensor Archives

**Beginner Level**: Hdf5 for large tensor archives is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain hdf5 for large tensor archives inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine hdf5 for large tensor archives with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
NOTE = 'Chunk shapes + compression for array stores'
print(NOTE)
```

#### Key Points

- Good for scientific arrays.
- Less ideal for frequent small updates.

---


### 26.11.7 Cloud Object Storage with `fsspec` (Pattern)

**Beginner Level**: Cloud object storage with `fsspec` (pattern) is a core step when you explore sales CSVs, plot KPI dashboards, or train churn models in a notebook—start with tiny examples and check dtypes before scaling up.

**Intermediate Level**: Production analytics jobs chain cloud object storage with `fsspec` (pattern) inside Airflow/Prefect tasks writing Parquet to a lake; you validate schemas, watch memory, and keep RNG seeds fixed for reproducible ML comparisons.

**Expert Level**: At scale you combine cloud object storage with `fsspec` (pattern) with Arrow, Polars, Dask, or Spark—optimizing for zero-copy IO, vectorized kernels, GPU backends, and statistically sound decisions that survive audit and drift monitoring.

```python
NOTE = 's3:// paths with role-based creds; avoid static keys'
print(NOTE)
```

#### Key Points

- Partition Hive-style for predicate pushdown.
- Watch egress fees.

---


---

## Topic Key Points

- NumPy/pandas are the backbone of Python data work—master dtypes, indexing, joins, and groupby before optimizing.
- Visualization carries analytical burden—label axes, show time ranges, choose scales honestly.
- Statistics and ML need clear baselines, clean splits, and documented assumptions about missingness and leakage.
- IO choices (Parquet/Arrow/SQL) affect cost, speed, and reproducibility across lakehouse stacks.

## Best Practices

- Fix seeds, pin versions, and snapshot datasets for reproducible research.
- Profile memory on production-sized samples.
- Keep train/validation/test leakage-free; fit preprocessors inside CV.
- Monitor schema drift and feature distributions in deployed models.
- Use structured logs in batch jobs; alert on validation failures.
- Prefer explicit dtypes and nullable types for missing data semantics.

## Common Mistakes to Avoid

- Silent pandas chained assignment bugs.
- Using floats for currency.
- Join explosions from duplicate keys.
- Reading all columns from huge CSVs.
- Data leakage from target-dependent preprocessing fit on full data.
- Interpreting p-values as effect sizes.
- Plotting without stating timeframe or filters.
- Shipping interactive dashboards without auth on sensitive metrics.

---

*End of Topic 26 — Data Science and Analytics.*
