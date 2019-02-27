// JavaScript source code


function ArcBall ()
{
    this.width = 0;
    this.height = 0;
    this.dragging = false;
    this.vecNew =  new Vector(0,0,0);
    this.vecOld =  new Vector(0,0,0);
    this.quatNew = new Quaternion(0.0, 0.0, 0.0, 1.0);
    this.quatOld = new Quaternion(0.0, 0.0, 0.0, 1.0);


    
    this.screen2Vector = function (x1, y1) {
        var v = { x: ((x1 / ((this.width - 1) / 2)) - 1), y: -((y1 / ((this.height - 1) / 2)) - 1) };

        var len = Math.sqrt(v.x * v.x + v.y * v.y);

        return (len > 1.0) ? new Vector(v.x / Math.sqrt(len), v.y / Math.sqrt(len), 0) : new Vector(v.x, v.y, Math.sqrt(1.0 - len));

    }

    this.start = function(x, y) 
    {
        this.dragging = true;
        this.vecOld = this.screen2Vector(x, y);
        this.quatOld = this.quatNew;

    }

    this.stop = function() 
    {
        this.dragging = false;

    }

    this.drag = function(x, y)
    {
        if(this.dragging) 
            this.vecNew = this.screen2Vector(x, y);

        var p = new Vector();
        p.crossOf(this.vecOld, this.vecNew);

        len = Math.sqrt(p.v[0]*p.v[0]+p.v[1]*p.v[1]+p.v[2]*p.v[2]);
        if(len>1e-5) {
            var q = new Quaternion(this.vecNew.dot(this.vecOld),p.v[0],p.v[1],p.v[2]);
            q.normalize();
            this.quatNew.crossOf(q,this.quatOld); 
        } else {
            var q = new Quaternion(0.0, 0.0, 0.0, 1.0);
            this.quatNew.crossOf(q, this.quatOld);            
        }

        

    }

    this.setWindowSize = function(w, h)
    {
        this.width = w;
        this.height = h;

    }

    this.rotation = function()
    {
        return this.quatNew.asMat4();
    }


}

/*
public:
        ArcBall() : mWidth(0), mHeight(0) {}

    void Begin(int x, int y);
    void End();
    void Drag(int x, int y);
    void SetWindowSize(int width, int height);
    const glm::mat3 Rotation() const { return glm::mat3_cast(mQuatNow); }

private:
        glm::vec3 ScreenToVector(float screenX, float screenY);

    int mWidth, mHeight;
    bool mDragging;
    glm::quat mQuatNow, mQuatDown;
    glm::vec3 mVecNow, mVecDown;
};


//-----------------------------------------------------------------------------
// ArcBall
//-----------------------------------------------------------------------------
void ArcBall::Begin(int x, int y) {
}
//-----------------------------------------------------------------------------
void ArcBall::End() {

}
//-----------------------------------------------------------------------------
void ArcBall::Drag(int x, int y) {
    if (mDragging) {
        mVecNow = ScreenToVector(static_cast<float>(x), static_cast<float>(y));

glm::vec3 p = glm::cross(mVecDown, mVecNow);

if (glm::length(p) > 1e-5) {
    glm::quat q = glm::quat(glm::dot(mVecDown, mVecNow), p);
    mQuatNow = glm::cross(glm::normalize(q), mQuatDown);
}
else {
            mQuatNow = glm::cross(glm::quat(), mQuatDown);
}
}
}
//-----------------------------------------------------------------------------
void ArcBall::SetWindowSize(int width, int height) {
    mWidth = width;
mHeight = height;
}
//-----------------------------------------------------------------------------
glm::vec3 ArcBall::ScreenToVector(float screenX, float screenY) {
    glm::vec2 v;
v.x = ((screenX / ((mWidth - 1) / 2)) - 1);
v.y = -((screenY / ((mHeight - 1) / 2)) - 1);

float len = glm::length(v);
if (len > 1.0f)
return glm::vec3(v / sqrt(len), 0);

return glm::vec3(v, sqrt(1.0f - len));
}
//-----------------------------------------------------------------------------
  */