import plotly.graph_objs as go
from plotly.subplots import make_subplots

fig = make_subplots(rows=1, cols=1)
z = [[3, 2, None, 12, 13, 14, 15, 16],
     [1, 1, None, 11, None, None, None, 17],
     [None, 2, 6, 7, None, None, None, 18],
     [None, 3, None, 8, None, None, None, 19],
     [55, 4, 10, 9, None, None, None, 20],
     [None, None, None, 27, None, None, None, 21],
     [None, None, None, 26, 25, 24, 23, 22]]

fig.add_trace(go.Contour(z=z, 
     showscale=False), 
     1, 1)

#fig.add_trace(go.Contour(z=z, showscale=False, connectgaps=True), 1, 2)
#fig.add_trace(go.Heatmap(z=z, showscale=False, zsmooth='best'), 2, 1)
#fig.add_trace(go.Heatmap(z=z, showscale=False, connectgaps=True, zsmooth='best'), 2, 2)

#fig['layout']['yaxis1'].update(title=dict(text='Contour map'))
#fig['layout']['yaxis3'].update(title=dict(text='Heatmap'))
#fig.write_image('test3_res1.svg', format='svg')

fig.show()
