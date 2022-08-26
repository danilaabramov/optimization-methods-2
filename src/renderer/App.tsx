import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';


import Plotly from 'plotly.js-dist';

const Hello = () => {
  function Determinant(A: number[][]) {
    var N = A.length, B: number[][] = [], denom = 1, exchanges = 0;
    for (var i = 0; i < N; ++i) {
      B[i] = [];
      for (var j = 0; j < N; ++j) B[i][j] = A[i][j];
    }
    for (var i = 0; i < N - 1; ++i) {
      var maxN = i, maxValue = Math.abs(B[i][i]);
      for (var j = i + 1; j < N; ++j) {
        var value = Math.abs(B[j][i]);
        if (value > maxValue) {
          maxN = j;
          maxValue = value;
        }
      }
      if (maxN > i) {
        var temp = B[i];
        // @ts-ignore
        B = B[maxN];
        B[maxN] = temp;
        ++exchanges;
      } else {
        if (maxValue == 0) return maxValue;
      }
      var value1 = B[i][i];
      for (var j = i + 1; j < N; ++j) {
        var value2 = B[j][i];
        B[j][i] = 0;
        for (var k = i + 1; k < N; ++k) B[j][k] = (B[j][k] * value1 - B[i][k] * value2) / denom;
      }
      denom = value1;
    }
    if (exchanges % 2) return -B[N - 1][N - 1];
    else return B[N - 1][N - 1];
  }

  function AdjugateMatrix(A: number[][])   // A - двумерный квадратный массив
  {
    var N = A.length, adjA: number[][] = [];
    for (var i = 0; i < N; i++) {
      adjA[i] = [];
      for (var j = 0; j < N; j++) {
        var B: number[][] = [], sign = ((i + j) % 2 == 0) ? 1 : -1;
        for (var m = 0; m < j; m++) {
          B[m] = [];
          for (var n = 0; n < i; n++) B[m][n] = A[m][n];
          for (var n = i + 1; n < N; n++) B[m][n - 1] = A[m][n];
        }
        for (var m = j + 1; m < N; m++) {
          B[m - 1] = [];
          for (var n = 0; n < i; n++) B[m - 1][n] = A[m][n];
          for (var n = i + 1; n < N; n++) B[m - 1][n - 1] = A[m][n];
        }
        adjA[i][j] = sign * Determinant(B);   // Функцию Determinant см. выше
      }
    }
    return adjA;
  }

  function InverseMatrix(A: number[][]) {
    var det = Determinant(A);
    var N = A.length, A = AdjugateMatrix(A);
    for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) A[i][j] /= det;
    return A;
  }

  let x: number[] = [];
  let y: number[] = [];
  let z: number[] = [];

  let x1: number[] = [];
  let y1: number[] = [];
  let z1: number[] = [];

  let x2: number[] = [];
  let y2: number[] = [];
  let z2: number[] = [];

  let x3: number[] = [];
  let y3: number[] = [];
  let z3: number[] = [];

  const x0 = 1;
  const y0 = 2;
  const alpha = Math.PI / 6;

  const eps = .01;
  const step = .01;
  const xstart = [3, 6];

  const f_xy = (x: number[]) => {
    return 2 * (x[0] - x0) ** 2 + (x[1] - y0) ** 2;
  };

  const gradF_xy = (x: number[]) => {
    return [4 * (x[0] - x0), 2 * (x[1] - y0)];
  };

  const H_xy = (x: number[]) => {
    return [[4, 0], [0, 2]];
  };

  const X_new = (x: number[]) => {
    return [(x[0] - x0) * Math.cos(alpha) + (x[1] - y0) * Math.sin(alpha),
      (x[1] - y0) * Math.sin(alpha) - (x[0] - x0) * Math.cos(alpha)];
  };

  const f_cosh_xy = (x: number[]) => {
    let x_new = X_new(x);
    return Math.cosh(x_new[0]) + Math.cosh(x_new[1]);
  };

  const gradF_cosh_xy = (x: number[]) => {
    let x_new = X_new(x);
    return [Math.sinh(x_new[0]) * Math.cos(alpha),
      Math.sinh(x_new[1]) * Math.sin(alpha)];
  };

  const H_cosh_xy = (x: number[]) => {
    let x_new = X_new(x);
    return [[Math.cosh(x_new[0]) * Math.cos(alpha) ** 2, 0],
      [0, Math.cosh(x[1]) * Math.sin(alpha) ** 2]];
  };

  const coordinateDescent = () => {
    let iteration = 0;
    let x = JSON.parse(JSON.stringify(xstart));

    x1.push(x[0]);
    y1.push(x[1]);
    z1.push(f_xy(x));
    let xPrev
    while(1) {
      xPrev = JSON.parse(JSON.stringify(x));
      for (let i = 0; i < 2; ++i) {
        let xNew = JSON.parse(JSON.stringify(x));
        xNew[i] += step;
        let fx = f_xy(x);
        let fxnew = f_xy(xNew);

        let s = step

        if(fxnew > fx) {
          xNew[i] -= s * 2;
          fxnew = f_xy(xNew);
          s = -step
        }
          for (; fxnew < fx; ++iteration) {
            x[i] = xNew[i];
            fx = fxnew;
            xNew[i] += s;
            fxnew = f_xy(xNew);

            x1.push(x[0]);
            y1.push(x[1]);
            z1.push(f_xy(x));
          }
      }
      if (Math.abs(x[0] - xPrev[0]) < eps && Math.abs(x[1] - xPrev[1]) < eps
        && Math.abs(f_xy(x) - f_xy(xPrev)) < eps) break;
    }
    console.log('Метод покоординатного спуска:\nМинимум функции:', x, '\nИтерации:', iteration);
  };

  const gradientDescent = () => {
    let x = JSON.parse(JSON.stringify(xstart));

    x2.push(x[0]);
    y2.push(x[1]);
    z2.push(f_xy(x));

    let xPrev, iter = 0
    while(1) {
      xPrev = JSON.parse(JSON.stringify(x));
      let gradFx = gradF_xy(x);
      x = [x[0] - step * gradFx[0], x[1] - step * gradFx[1]]
      let fxPrev = f_xy(xPrev);
      let fx = f_xy(x);

      x2.push(x[0]);
      y2.push(x[1]);
      z2.push(fx);

      for (; fx < fxPrev; ++iter) {
        console.log(iter, x[0],x[1])
        x = [x[0] - step * gradFx[0], x[1] - step * gradFx[1]]
        fxPrev = fx;
        fx = f_xy(x);

        x2.push(x[0]);
        y2.push(x[1]);
        z2.push(fx);
      }
      if (Math.abs(x[0] - xPrev[0]) < eps && Math.abs(x[1] - xPrev[1]) < eps
        && Math.abs(fx - fxPrev) < eps) break;
    }
    console.log('Метод градиентного спуска:\nМинимум функции:', x, '\nИтерации:', iter);
  };

  const NewtonsMetod = () => {
    let x = JSON.parse(JSON.stringify(xstart));

    x3.push(x[0]);
    y3.push(x[1]);
    z3.push(f_xy(x));

    let iteration = 0, xPrev;
    while(1) {
      xPrev = JSON.parse(JSON.stringify(x));
      x = [x[0] - InverseMatrix(H_xy(x))[0][0] * gradF_xy(x)[0],
        x[1] - InverseMatrix(H_xy(x))[1][1] * gradF_xy(x)[1]];
      ++iteration

      x3.push(x[0]);
      y3.push(x[1]);
      z3.push(f_xy(x));

      if (Math.abs(x[0] - xPrev[0]) < eps && Math.abs(x[1] - xPrev[1]) < eps
        && Math.abs(f_xy(x) - f_xy(xPrev)) < eps) break;
    }
    console.log('Метод Ньютона:\nМинимум функции:', x, '\nИтерации:', iteration);
  };


  useEffect(() => {
    for (let ix = x0 - 5; ix <= x0 + 5; ix += 0.1) {
      for (let iy = y0 - 5; iy <= y0 + 5; iy += 0.1) {
        if (f_xy([ix, iy]) < f_xy([x0 + 5, y0 + 5]) ) {
          x.push(ix);
          y.push(iy);
          z.push(f_xy([ix, iy]));
        }
      }
    }

    coordinateDescent();
    gradientDescent();
    NewtonsMetod();

    Plotly.newPlot('myDiv', [{ type: 'mesh3d', x, y, z },
        {
          x: x1, y: y1, z: z1,
          type: 'scatter3d',
          mode: 'lines+markers',
          line: { width: 2, color: 'red' },
          marker: { size: 2, color: 'red' }
        },
        {
          x: x2, y: y2, z: z2,
          type: 'scatter3d',
          mode: 'lines+markers',
          line: { width: 2, color: 'green' },
          marker: { size: 2, color: 'green' }
        },
        {
          x: x3, y: y3, z: z3,
          type: 'scatter3d',
          mode: 'lines+markers',
          line: { width: 2, color: 'yellow' },
          marker: { size: 2, color: 'yellow' }
        }
      ], { width: 2000, height: 1000 }
    );
  }, []);

  return (
    <div>
      <div className='Hello'>
        <div style={{ transform: 'scale(1.5)' }} id='myDiv' />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Hello />} />
      </Routes>
    </Router>
  );
}
