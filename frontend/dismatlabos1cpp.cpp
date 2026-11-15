
#include <iostream>
#include <iomanip>
#include <vector>
using namespace std;

int main() {
    int M, g, a, l, e, b;

    cout << "M = ";
    cin >> M;
    cout << "g = ";
    cin >> g;
    cout << "a = ";
    cin >> a;
    cout << "l = ";
    cin >> l;
    cout << "e = ";
    cin >> e;
    cout << "b = ";
    cin >> b;

    int slova[5] = {g, a, l, e, b};

    // dp[n] predstavlja broj razlicitih rijeci duljine n
    vector<long long> dp(M + 1, 0);

    dp[0] = 1;

    // Obrada svakog slova
    for (int i = 0; i < 5; i++) {
        // Dodavanje slova u postojece rijeci
        for (int n = 1; n <= M; n++) {
            for (int k = 1; k <= slova[i] && k <= n; k++) {
                // Broj nacina dodavanja k pojavljivanja slova
                // na mjesta u rijeci
                // Ovaj pristup koristimo preko binomnih koeficijenata
            }
        }
    }

    // Racunanje broja rijeci pomocu kombinacija
    vector<vector<long long>> C(M + 1, vector<long long>(M + 1, 0));

    for (int i = 0; i <= M; i++) {
        C[i][0] = C[i][i] = 1;

        for (int j = 1; j < i; j++) {
            C[i][j] = C[i - 1][j - 1] + C[i - 1][j];
        }
    }

    dp.assign(M + 1, 0);
    dp[0] = 1;

    for (int i = 0; i < 5; i++) {
        vector<long long> novi(M + 1, 0);

        for (int n = 0; n <= M; n++) {
            for (int k = 0; k <= slova[i] && k <= n; k++) {
                novi[n] += dp[n - k] * C[n][k];
            }
        }

        dp = novi;
    }

    // Racunanje faktorijela
    long double faktorijel = 1;

    for (int n = 1; n <= M; n++) {
        faktorijel *= n;

        cout << n << " "
             << fixed << setprecision(10)
             << (long double)dp[n] / faktorijel << " "
             << dp[n] << endl;
    }

    return 0;
}
