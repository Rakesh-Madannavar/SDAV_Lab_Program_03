import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

np.random.seed(42)

x = np.linspace(-4,4,400)
std_normal = stats.norm(0, 1)
print('68-95-99.7 Rule : ')
print(f' P(-1<Z<1) = {std_normal.cdf(1) - std_normal.cdf(-1):.6f}')
print(f' P(-2<Z<2) = {std_normal.cdf(2) - std_normal.cdf(-2):.6f}')
print(f' P(-3<Z<3) = {std_normal.cdf(3) - std_normal.cdf(-3):.6f}\n') 

#Z-Score Standardization
mu_exam,sigma_exam = 70, 10
for score in [60, 70, 80, 90]:
    z_score = (score - mu_exam) / sigma_exam
    pct=std_normal.cdf(z_score)*100
    print(f' Score={score}: Z={z_score:.2f}, Percentile={pct:.1f}%')


# Exponential Distributione
lam=1.0
exp_dist = stats.expon(scale=1/lam)
print(f'\nexp(lam=1): mean={exp_dist.mean()}, var={exp_dist.var()}')

#memory property
print(f'P(x>2)  = {1-exp_dist.cdf(2):.6f}')
print(f'P(x>3|x>1) = {(1-exp_dist.cdf(3)) / (1-exp_dist.cdf(1)):.6f}')

# CENTRAL LIMIT THEOREM 

sample_sizes = [ 5, 30, 100, 150]
fig, axes = plt.subplots(1, 4, figsize=(16, 4))

for i, n in enumerate(sample_sizes):
    means = [np.mean(np.random.exponential(1, n)) for _ in range(3000)]
    axes[i].hist(means, bins=50, density=True,
                 color='steelblue', edgecolor='black', alpha=0.7)
    axes[i].set_title(f'n={n}\nMean={np.mean(means):.3f}')
    axes[i].set_xlabel('Sample Mean')

fig.suptitle('CLT: Sample Means of Exp(1)', fontsize=13, fontweight='bold')
plt.tight_layout(); plt.show()


# # central  limit therom 
# sample_sizes = [ 5, 30, 100]
# fig, axes = plt.subplots(1, 4, figsize=(16, 4))
# for i, n in enumerate(sample_sizes):
#     means = [np.mean(np.random.exponential(1, n)) for _ in range(3000)]
#     axes[i].hist(means, bins=50, density=True,
#                     color='steelblue', edgecolor='black', alpha=0.7)
#     axes[i].set_title(f'n={n}\nMean={np.mean(means):.3f}')
#     axes[i].set_xlabel('Sample Mean')

# fig.suptitle('CLT: Sample Means of Exp(1)', fontsize=13, fontweight='bold')
# plt.tight_layout(); 
# plt.show()