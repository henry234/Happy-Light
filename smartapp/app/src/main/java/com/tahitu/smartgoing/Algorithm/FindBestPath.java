package com.tahitu.smartgoing.Algorithm;

/**
 * Created by DELL on 12/7/2016.
 */

public class FindBestPath {
    public static double  best = Double.MAX_VALUE;
    public static Boolean[] check = new Boolean[11];
    public static float[] T = new float[11];
    public static int[] trace = new int[11];
    public static int[] bestTrace = new int[11];
    public static Route[][] matrixRoute;
    private static int n;

    public static void calCost(int i)
    {
        for (int j = 1; j <= n; j++)
        {
            if (check[j] == false)
            {
                trace[i] = j;
                T[i] = T[i - 1] + matrixRoute[trace[i - 1]][j].distance.value;

                if (T[i] < best)
                {
                    if (i < n)
                    {
                        check[j] = true;
                        calCost(i + 1);
                        check[j] = false;
                    }
                    else
                    {
                        best = T[n];
                        for (int k = 1; k <= n; k++)
                            bestTrace[k] = trace[k];
                        //cout << "\n-------" << best << "\n";
                    }

                }
            }

        }
    }

    public static int[] getBestPath(int total) {
        n = SolutionMap.getSizeListPlaces();
        best = Double.MAX_VALUE;

        for (int i=1; i < 10; i++) {
            check[i] = false;
            T[i] = 0;
            trace[i] = 0;
            bestTrace[i] = 0;
        }

        trace[1] = 1;
        check[1] = true;
        n=total;
        calCost(2);

        return bestTrace;
    }
}
