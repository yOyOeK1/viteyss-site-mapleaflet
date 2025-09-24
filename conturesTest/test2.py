import numpy as np
import matplotlib.pyplot as plt







def f(x,y):
    #print(f"f: x:\n\n{x}\n\n\n,y:\n{y}\n\n")
    return (1 - x / 2 + x ** 5 + y ** 3) * np.exp(-x ** 2 - y ** 2)

if 0:
    n = 256
    x = np.linspace(-3, 3, n)
    y = np.linspace(-3, 3, n)
    X, Y = np.meshgrid(x, y)

    plt.contourf(X, Y, f(X, Y), 8, alpha=.75, cmap=plt.cm.hot)

elif 1:
    z = [[3, 2, None, 12, 13, 14, 15, 16],
        [1, 1, None, 11, 3,3, 9, 17],
        [None, 2, 6, 7, 1, 3, 8, 18],
        [None, 3, None, 8, 1, 2, 9, 19],
        [55, 4, 10, 9, 1, 2, 3, 20],
        [None, None, None, 27, 20, 19, 20, 21],
        [None, None, None, 26, 25, 24, 23, 22]]

    print( f" len:{len(z)} over {len(z[0])}" )
    xLen = len(z[0])
    yLen= len(z)
    x = np.arange( xLen )
    y = np.arange( yLen )
    X,Y = np.meshgrid(x,y)

    plt.contourf(X, Y, z, 20, alpha=1., cmap=plt.cm.cividis)


# labels on line
C = plt.contour(X, Y, z, 8, colors='black', linewidth=.5)
plt.clabel(C, inline=1, fontsize=8)

plt.axis('off')
plt.gca().set_position([0, 0, 1, 1])

plt.savefig("test2_res1.svg",transparent=True)
#plt.show()

#plt.xticks([])
#plt.yticks([])


# Add a title and a box around it
#from matplotlib.patches import FancyBboxPatch
#ax = plt.gca()
#ax.add_patch(FancyBboxPatch((-0.05, .87),
#                            width=.66, height=.165, clip_on=False,
#                            boxstyle="square,pad=0", zorder=3,
#                            facecolor='white', alpha=1.0,
#                            transform=plt.gca().transAxes))


#plt.text(-0.05, 1.02, " Contour Plot: plt.contour(..)\n",
#      horizontalalignment='left',
#      verticalalignment='top',
#      size='xx-large',
#      transform=plt.gca().transAxes)

#plt.text(-0.05, 1.01, "\n\n  Draw contour lines and filled contours ",
#      horizontalalignment='left',
#      verticalalignment='top',
#      size='large',
#      transform=plt.gca().transAxes)
